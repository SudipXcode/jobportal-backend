
import natural from 'natural';
import cosineSimilarity from 'cosine-similarity';

import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();

export const getRecommendedJobsService = async (userId, limit = 10) => {
    // 1. Get jobseeker profile
    const user = await prisma.user.findUnique({
        where: { userId },
        include: { jobseekerProfile: true }
    });

    if (!user || !user.jobseekerProfile) {
        throw new Error('Jobseeker profile not found for this user');
    }

    const jobseekerId = user.jobseekerProfile.jobseekerProfileId;

    const jobseeker = await prisma.jobseekerProfile.findUnique({
        where: { jobseekerProfileId: jobseekerId },
        include: {
            skills: true,
            jobPreferences: true,
            jobseekerEducation: true
        }
    });

    if (!jobseeker) throw new Error('Jobseeker not found');

    // Combine jobseeker info into one text string
    const seekerText = `
        ${jobseeker.skills.map(s => s.name).join(' ')}
        ${jobseeker.jobPreferences.map(p => p.title).join(' ')}
        ${jobseeker.jobseekerEducation.map(e => `${e.degree} ${e.fieldOfStudy}`).join(' ')}
    `.toLowerCase();

    // 2. Get jobs with skills & qualifications
    const jobs = await prisma.jobs.findMany({
        include: {
            jobRequiredSkills: true,
            jobQualifications: true
        }
    });

    // 3. NLP tokenizer
    const tokenizer = new natural.WordTokenizer();
    const seekerTokens = tokenizer.tokenize(seekerText);

    // 4. Rank jobs by similarity
    const rankedJobs = jobs.map(job => {
        const jobText = `
            ${job.title}
            ${job.description}
            ${job.jobRequiredSkills.map(s => s.skillName).join(' ')}
            ${job.jobQualifications.map(q => q.qualificationName).join(' ')}
        `.toLowerCase();

        const jobTokens = tokenizer.tokenize(jobText);

        // TF-IDF vectorizer
        const tfidf = new natural.TfIdf();
        tfidf.addDocument(seekerTokens.join(' '));
        tfidf.addDocument(jobTokens.join(' '));

        const seekerVector = [];
        const jobVector = [];

        tfidf.listTerms(0).forEach(term => {
            seekerVector.push(term.tfidf);
            const jobTerm = tfidf.listTerms(1).find(t => t.term === term.term);
            jobVector.push(jobTerm ? jobTerm.tfidf : 0);
        });

        const score = cosineSimilarity(seekerVector, jobVector);

        return { ...job, similarityScore: score };
    });

    // 5. Sort & return
    rankedJobs.sort((a, b) => b.similarityScore - a.similarityScore);
    return rankedJobs.slice(0, limit);
};
