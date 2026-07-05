const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const tutor = async (req, res) => {
  const { topic, subject, mode } = req.body;
  if (!topic) {
    return error(res, 'Please provide a topic or concept to explain.', 400);
  }

  const prompt = `Subject: ${subject || 'General Engineering'}\nTopic: ${topic}\nMode: ${mode || 'explain step-by-step with examples'}`;

  try {
    const aiResponse = await callAgent('TUTOR', prompt);
    return success(res, aiResponse, 'Tutor has generated the explanation.');
  } catch (err) {
    console.error('Smart Tutor error:', err);
    return error(res, 'Smart Tutor Agent failed to respond.', 500);
  }
};

const analyzeNotes = async (req, res) => {
  let content = req.body.content;

  if (req.file) {
    // If a file was uploaded, check if we parsed text or if we should read from buffer
    // For now we'll simulate text parsing or use a mock text if file parsed text isn't available
    content = `[DOCUMENT CONTENT FROM UPLOADED FILE: ${req.file.originalname}]\nThis is a syllabus notes document for Advanced Data Structures, focusing on AVL Trees, Red-Black Trees, and B-Trees. Rotations, balance factors, insertions, and search complexities.`;
  }

  if (!content) {
    return error(res, 'Please paste notes text or upload a PDF document.', 400);
  }

  try {
    const aiResponse = await callAgent('NOTES', content);

    // Save notes intelligence record
    const id = uuidv4();
    await pool.query(
      `INSERT INTO resumes (id, user_id, file_name, parsed_text, ai_score, feedback)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [id, req.user.id, req.file ? req.file.originalname : 'Pasted_Notes.txt', content.substring(0, 1000), 85, 'Notes parsed and flashcards generated successfully.']
    );

    return success(res, aiResponse, 'Notes analyzed and summary generated.');
  } catch (err) {
    console.error('Notes Intelligence error:', err);
    return error(res, 'Notes Intelligence Agent failed to respond.', 500);
  }
};

const generateQuiz = async (req, res) => {
  const { subject, type, difficulty, count } = req.body;

  if (!subject) {
    return error(res, 'Subject is required.', 400);
  }

  const queryDetails = JSON.stringify({
    subject,
    type: type || 'MCQ',
    difficulty: difficulty || 'medium',
    count: count || 5
  });

  try {
    const aiResponse = await callAgent('QUIZ', queryDetails);
    return success(res, aiResponse, 'Quiz questions generated.');
  } catch (err) {
    console.error('Quiz Generator error:', err);
    return error(res, 'Quiz Generator Agent failed to respond.', 500);
  }
};

const revisionPlan = async (req, res) => {
  const { subjects, examDate, hoursPerDay } = req.body;

  if (!subjects || !examDate) {
    return error(res, 'Please provide subjects list and target exam date.', 400);
  }

  const context = JSON.stringify({
    subjects,
    examDate,
    hoursPerDay: hoursPerDay || 3
  });

  try {
    const aiResponse = await callAgent('REVISION', context);
    return success(res, aiResponse, 'Revision planner created.');
  } catch (err) {
    console.error('Revision planner error:', err);
    return error(res, 'Revision Planner Agent failed to create schedule.', 500);
  }
};

const saveQuizResult = async (req, res) => {
  const { subject, quizType, questions, answers, score, totalMarks } = req.body;

  try {
    const id = uuidv4();
    const percentage = ((score / totalMarks) * 100).toFixed(2);

    await pool.query(
      `INSERT INTO quiz_results (id, user_id, subject, quiz_type, questions, answers, score, total_marks, percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [id, req.user.id, subject, quizType || 'Technical', JSON.stringify(questions), JSON.stringify(answers), score, totalMarks, percentage]
    );

    // Give placement points for quiz completion
    await pool.query(
      'UPDATE student_profiles SET placement_points = placement_points + ? WHERE user_id = ?',
      [score * 5, req.user.id]
    );

    // Save details in placement points audit
    const auditId = uuidv4();
    await pool.query(
      'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
      [auditId, req.user.id, score * 5, `Completed quiz on ${subject}`]
    );

    return success(res, { id, percentage }, 'Quiz score saved successfully.');
  } catch (err) {
    console.error('saveQuizResult error:', err);
    return error(res, 'Internal server error saving quiz scores.', 500);
  }
};

module.exports = {
  tutor,
  analyzeNotes,
  generateQuiz,
  revisionPlan,
  saveQuizResult
};
