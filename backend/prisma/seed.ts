import { PrismaClient, Role, ApplicationStatus, InternshipStatus, CompanyStatus, InterviewStatus, InterviewResult, SystemFeedbackType, SystemFeedbackStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for College Internship Management System...');

  // Clear existing data in reverse relation order for clean idempotency
  await prisma.systemFeedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationTimeline.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.company.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();

  // Secure default demo password satisfying validation: Uppercase, Lowercase, Number, Special character
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  console.log('🔑 Demo Accounts Password:', defaultPassword);

  // 1. Create ADMIN
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log(`✅ Admin created: ${adminUser.email}`);

  // 2. Create FACULTY
  const facultyUser1 = await prisma.user.create({
    data: {
      email: 'faculty@example.com',
      passwordHash,
      role: Role.FACULTY,
      isActive: true,
      isVerified: true,
    },
  });

  const faculty1 = await prisma.faculty.create({
    data: {
      userId: facultyUser1.id,
      name: 'Dr. Evelyn Reed',
      department: 'Computer Science & Engineering',
      phone: '+1-555-019-2834',
    },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'faculty2@example.com',
      passwordHash,
      role: Role.FACULTY,
      isActive: true,
      isVerified: true,
    },
  });

  const faculty2 = await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      name: 'Prof. Marcus Vance',
      department: 'Data Science & Artificial Intelligence',
      phone: '+1-555-019-4821',
    },
  });
  console.log(`✅ Faculty created: ${faculty1.name}, ${faculty2.name}`);

  // 3. Create STUDENTS
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@example.com',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isVerified: true,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      name: 'Alex Morgan',
      department: 'Computer Science',
      phone: '+1-555-014-9923',
      GPA: 3.85,
      resume: '/uploads/sample-resume-alex-morgan.pdf',
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isVerified: true,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      name: 'Sophia Chen',
      department: 'Computer Science & Engineering',
      phone: '+1-555-017-3849',
      GPA: 3.92,
      resume: '/uploads/sample-resume-sophia-chen.pdf',
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isVerified: true,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      name: 'Liam Patel',
      department: 'Information Systems',
      phone: '+1-555-018-7712',
      GPA: 3.65,
      resume: '/uploads/sample-resume-liam-patel.pdf',
    },
  });

  // Resumes records
  await prisma.resume.createMany({
    data: [
      {
        studentId: student1.id,
        fileName: 'Alex_Morgan_Software_Engineer_Resume.pdf',
        fileUrl: '/uploads/sample-resume-alex-morgan.pdf',
        fileSize: 245000,
      },
      {
        studentId: student2.id,
        fileName: 'Sophia_Chen_ML_Researcher_CV.pdf',
        fileUrl: '/uploads/sample-resume-sophia-chen.pdf',
        fileSize: 310000,
      },
    ],
  });
  console.log(`✅ Students created: ${student1.name}, ${student2.name}, ${student3.name}`);

  // 4. Create COMPANIES
  const company1 = await prisma.company.create({
    data: {
      name: 'TechCorp Solutions',
      registrationNumber: 'REG-TC-2024-8891',
      location: 'San Francisco, CA',
      contactPerson: 'Sarah Jenkins (VP of Talent)',
      email: 'careers@techcorp.io',
      phone: '+1-415-555-0100',
      description: 'Leading enterprise cloud computing and modern full-stack web applications firm.',
      status: CompanyStatus.active,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Nexus Artificial Intelligence',
      registrationNumber: 'REG-NX-2023-4412',
      location: 'Boston, MA',
      contactPerson: 'David Liang (Head of AI Research)',
      email: 'internships@nexusai.tech',
      phone: '+1-617-555-0144',
      description: 'Frontier AI lab developing state-of-the-art vision and multimodal foundation systems.',
      status: CompanyStatus.active,
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'CloudScale DevOps Inc.',
      registrationNumber: 'REG-CS-2022-1109',
      location: 'Austin, TX',
      contactPerson: 'Rachel Rivera (Director of Engineering)',
      email: 'talent@cloudscale.net',
      phone: '+1-512-555-0188',
      description: 'Kubernetes, multi-cloud infrastructure and reliability engineering consultancy.',
      status: CompanyStatus.active,
    },
  });

  const company4 = await prisma.company.create({
    data: {
      name: 'CyberShield Security Labs',
      registrationNumber: 'REG-CSL-2021-9304',
      location: 'Seattle, WA',
      contactPerson: 'Jonathan Brand (Security Operations Lead)',
      email: 'jobs@cybershieldlabs.com',
      phone: '+1-206-555-0165',
      description: 'Next-generation threat detection, zero-trust network infrastructure and application defense.',
      status: CompanyStatus.active,
    },
  });

  const company5 = await prisma.company.create({
    data: {
      name: 'QuantumData Analytics Corp',
      registrationNumber: 'REG-QD-2023-7721',
      location: 'Chicago, IL',
      contactPerson: 'Marcus Sterling (Director of Data Engineering)',
      email: 'careers@quantumdata.io',
      phone: '+1-312-555-0177',
      description: 'Enterprise data lakehouse, real-time analytics streaming platforms and Apache Kafka pipelines.',
      status: CompanyStatus.active,
    },
  });

  const company6 = await prisma.company.create({
    data: {
      name: 'Apex Mobile & Cloud Systems',
      registrationNumber: 'REG-AM-2024-3319',
      location: 'New York, NY',
      contactPerson: 'Elena Rostova (Lead Mobile Architect)',
      email: 'internships@apexmobile.com',
      phone: '+1-212-555-0199',
      description: 'Cross-platform mobile frameworks, Swift, Kotlin, React Native, and high-concurrency edge APIs.',
      status: CompanyStatus.active,
    },
  });

  const company7 = await prisma.company.create({
    data: {
      name: 'BioHealth Informatics Lab',
      registrationNumber: 'REG-BH-2022-5540',
      location: 'San Diego, CA',
      contactPerson: 'Dr. Chloe Bennett (VP of Informatics)',
      email: 'talent@biohealthlab.org',
      phone: '+1-858-555-0122',
      description: 'Cutting-edge healthcare informatics, clinical data pipelines, and genomics visualization software.',
      status: CompanyStatus.active,
    },
  });
  console.log('✅ Companies created: 7 companies registered');

  // 5. Create INTERNSHIPS
  const now = new Date();
  const futureStartDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(now.getTime() + (14 + 16 * 7) * 24 * 60 * 60 * 1000); // 16 weeks
  const deadlineDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days in future
  const longDeadlineDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days in future

  const internship1 = await prisma.internship.create({
    data: {
      companyId: company1.id,
      facultyId: faculty1.id,
      title: 'Full-Stack Software Engineering Intern',
      description:
        'Join our core product team building high-performance microservices and React web applications. You will collaborate directly with staff engineers, write production code, participate in architecture reviews, and gain hands-on experience with modern CI/CD pipelines.',
      domain: 'Software Engineering',
      duration: '16 weeks',
      durationWeeks: 16,
      stipend: 3200.0,
      location: 'San Francisco, CA / Hybrid',
      startDate: futureStartDate,
      endDate: futureEndDate,
      applicationDeadline: deadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship2 = await prisma.internship.create({
    data: {
      companyId: company2.id,
      facultyId: faculty2.id,
      title: 'Machine Learning Research Intern',
      description:
        'Conduct applied research in computer vision, diffusion models, and neural architecture optimization. Ideal for students with strong foundations in linear algebra, PyTorch, and distributed training systems.',
      domain: 'Artificial Intelligence',
      duration: '20 weeks',
      durationWeeks: 20,
      stipend: 3800.0,
      location: 'Boston, MA / Remote',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 20 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: deadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship3 = await prisma.internship.create({
    data: {
      companyId: company3.id,
      facultyId: faculty1.id,
      title: 'Cloud Infrastructure & Site Reliability Intern',
      description:
        'Hands-on experience deploying Kubernetes clusters, Terraform infrastructure-as-code, Prometheus monitoring, and automated failover architectures across AWS and GCP environments.',
      domain: 'Cloud & DevOps',
      duration: '12 weeks',
      durationWeeks: 12,
      stipend: 2900.0,
      location: 'Austin, TX / Remote',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 12 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: deadlineDate,
      status: InternshipStatus.active,
    },
  });

  const internship4 = await prisma.internship.create({
    data: {
      companyId: company4.id,
      facultyId: faculty1.id,
      title: 'Cybersecurity Threat Intelligence Intern',
      description:
        'Assist incident response teams, analyze adversary malware signatures, audit web application security headers, and implement automated vulnerability scans for enterprise customers.',
      domain: 'Cybersecurity',
      duration: '12 weeks',
      durationWeeks: 12,
      stipend: 2750.0,
      location: 'Seattle, WA',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 12 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: deadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship5 = await prisma.internship.create({
    data: {
      companyId: company5.id,
      facultyId: faculty2.id,
      title: 'Data Platform & Distributed Analytics Intern',
      description:
        'Build scalable data ingest pipelines with Apache Spark, Kafka, and Snowflake. Develop real-time dashboard analytics, optimize complex SQL warehouse transformations, and collaborate with business intelligence analysts.',
      domain: 'Data Science',
      duration: '14 weeks',
      durationWeeks: 14,
      stipend: 3100.0,
      location: 'Chicago, IL / Hybrid',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 14 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: longDeadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship6 = await prisma.internship.create({
    data: {
      companyId: company6.id,
      facultyId: faculty1.id,
      title: 'Mobile Application Engineering Intern (iOS/Android)',
      description:
        'Collaborate on our flagship consumer mobile applications using React Native and native Swift/Kotlin modules. Implement smooth gesture animations, offline caching with SQLite, and biometric authentication workflows.',
      domain: 'Mobile Development',
      duration: '12 weeks',
      durationWeeks: 12,
      stipend: 3000.0,
      location: 'New York, NY / Remote',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 12 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: longDeadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship7 = await prisma.internship.create({
    data: {
      companyId: company7.id,
      facultyId: faculty2.id,
      title: 'Bioinformatics & Clinical Software Intern',
      description:
        'Participate in development of web platforms processing healthcare records and clinical genome sequences. Work with FHIR standard APIs, secure HIPAA compliant datastores, and Python bioinformatics toolkits.',
      domain: 'Software Engineering',
      duration: '16 weeks',
      durationWeeks: 16,
      stipend: 3300.0,
      location: 'San Diego, CA / Hybrid',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 16 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: longDeadlineDate,
      status: InternshipStatus.approved,
    },
  });

  const internship8 = await prisma.internship.create({
    data: {
      companyId: company3.id,
      facultyId: faculty1.id,
      title: 'DevOps Automation & Cloud Tooling Intern',
      description:
        'Design automated infrastructure test suites, CI/CD GitHub Actions workflows, container vulnerability scanning, and multi-region AWS Terraform blueprints alongside senior DevOps mentors.',
      domain: 'Cloud & DevOps',
      duration: '12 weeks',
      durationWeeks: 12,
      stipend: 2850.0,
      location: 'Remote',
      startDate: futureStartDate,
      endDate: new Date(now.getTime() + (14 + 12 * 7) * 24 * 60 * 60 * 1000),
      applicationDeadline: longDeadlineDate,
      status: InternshipStatus.approved,
    },
  });

  console.log('✅ Internships created: 8 internship postings (7 approved, 1 active)');

  // 6. Create APPLICATIONS with Timeline, Interview, Evaluation
  // Student 1 (Alex) applied to Internship 1 (TechCorp) -> Accepted
  const app1 = await prisma.application.create({
    data: {
      studentId: student1.id,
      internshipId: internship1.id,
      resume: '/uploads/sample-resume-alex-morgan.pdf',
      coverLetter:
        'I am an enthusiastic full-stack developer with 2 years of React, Node.js, and TypeScript project experience. I have contributed to open-source developer tooling and built scalable RESTful backends. I would love to bring my technical background and problem-solving skills to TechCorp.',
      qualifications: 'React, TypeScript, Node.js, Express, MySQL, Docker, REST APIs, Git',
      status: ApplicationStatus.accepted,
      appliedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.applicationTimeline.createMany({
    data: [
      {
        applicationId: app1.id,
        status: ApplicationStatus.pending,
        comments: 'Application received and passed preliminary GPA verification.',
        actionBy: 'System',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app1.id,
        status: ApplicationStatus.shortlisted,
        comments: 'Outstanding GitHub projects and strong academic transcript. Shortlisted for technical round.',
        actionBy: 'Dr. Evelyn Reed',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app1.id,
        status: ApplicationStatus.accepted,
        comments: 'Cleared technical interview with high marks. Official internship offer extended!',
        actionBy: 'Sarah Jenkins (TechCorp)',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Interview for App 1
  await prisma.interview.create({
    data: {
      applicationId: app1.id,
      interviewDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      interviewer: 'Sarah Jenkins & Alex Rivera (Staff Eng)',
      interviewMode: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      result: InterviewResult.passed,
      status: InterviewStatus.completed,
      comments: 'Demonstrated solid understanding of React component lifecycle, async state management, and database normalization.',
    },
  });

  // Evaluation for App 1
  await prisma.evaluation.create({
    data: {
      applicationId: app1.id,
      evaluatorId: facultyUser1.id,
      technicalSkills: 5,
      softSkills: 5,
      punctuality: 5,
      responsibility: 5,
      teamwork: 5,
      learningAbility: 5,
      overallRating: 5.0,
      comments: 'Exceptional candidate. Proactive communication and strong architectural instinct.',
    },
  });

  // Feedback for TechCorp from Student 1
  await prisma.feedback.create({
    data: {
      studentId: student1.id,
      companyId: company1.id,
      internshipId: internship1.id,
      rating: 5,
      companyCulture: 5,
      mentorshipQuality: 5,
      technicalLearning: 5,
      workEnvironment: 5,
      overallExperience: 5,
      comments: 'Phenomenal interview experience, clear communication from HR, and great engineering culture.',
      suggestions: 'Keep offering hybrid work flexibility for students during the academic semester.',
    },
  });

  // Student 1 also applied to Internship 3 (CloudScale) -> Shortlisted
  const app2 = await prisma.application.create({
    data: {
      studentId: student1.id,
      internshipId: internship3.id,
      resume: '/uploads/sample-resume-alex-morgan.pdf',
      coverLetter:
        'Passionate about cloud reliability and containerization. Experienced with Docker and basic Kubernetes orchestration.',
      qualifications: 'Docker, Linux, AWS EC2, GitHub Actions, Python',
      status: ApplicationStatus.shortlisted,
      appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.applicationTimeline.createMany({
    data: [
      {
        applicationId: app2.id,
        status: ApplicationStatus.pending,
        comments: 'Application received.',
        actionBy: 'Student',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app2.id,
        status: ApplicationStatus.shortlisted,
        comments: 'Resume shortlisted for upcoming technical assessment.',
        actionBy: 'Rachel Rivera',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Upcoming Interview for App 2 (at least 24h notice in future)
  await prisma.interview.create({
    data: {
      applicationId: app2.id,
      interviewDate: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hours in future
      interviewer: 'Rachel Rivera (Director of Engineering)',
      interviewMode: 'Zoom Video Call',
      meetingLink: 'https://zoom.us/j/9876543210',
      result: InterviewResult.pending,
      status: InterviewStatus.scheduled,
      comments: 'Technical screening on Linux commands, container lifecycle, and cloud storage basics.',
    },
  });

  // Student 2 (Sophia) applied to Internship 2 (Nexus AI) -> Shortlisted
  const app3 = await prisma.application.create({
    data: {
      studentId: student2.id,
      internshipId: internship2.id,
      resume: '/uploads/sample-resume-sophia-chen.pdf',
      coverLetter:
        'Senior undergraduate specializing in deep learning and NLP. Published a workshop paper on attention mechanism optimizations.',
      qualifications: 'PyTorch, Python, NumPy, Pandas, CUDA, Transformers, HuggingFace',
      status: ApplicationStatus.shortlisted,
      appliedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: app3.id,
      status: ApplicationStatus.shortlisted,
      comments: 'Outstanding research portfolio and GPA (3.92). Shortlisted for research panel.',
      actionBy: 'Prof. Marcus Vance',
    },
  });

  // Student 3 (Liam) applied to Internship 4 (CyberShield) -> Pending
  await prisma.application.create({
    data: {
      studentId: student3.id,
      internshipId: internship4.id,
      resume: '/uploads/sample-resume-liam-patel.pdf',
      coverLetter: 'Interested in network security, Wireshark packet inspection, and vulnerability remediation.',
      qualifications: 'Network+, Linux, Python scripting, OWASP Top 10',
      status: ApplicationStatus.pending,
      appliedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. System Feedback
  await prisma.systemFeedback.createMany({
    data: [
      {
        userId: studentUser1.id,
        type: SystemFeedbackType.feature,
        description: 'It would be wonderful to have automated email/calendar reminders for interview schedules.',
        status: SystemFeedbackStatus.in_progress,
        adminResponse: 'Great suggestion! We are integrating calendar export (.ics) and automated reminder hooks.',
      },
      {
        userId: facultyUser1.id,
        type: SystemFeedbackType.improvement,
        description: 'Add quick filters by student GPA range in the applicant review dashboard.',
        status: SystemFeedbackStatus.resolved,
        adminResponse: 'Implemented! GPA sorting and range filtering is now active on the applications table.',
      },
    ],
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser1.id,
        title: 'Offer Extended! 🎉',
        message: 'Congratulations! Your application for Full-Stack Software Engineering Intern has been accepted.',
        isRead: false,
        type: 'APPLICATION',
        link: '/student/applications',
      },
      {
        userId: studentUser1.id,
        title: 'Upcoming Interview Scheduled',
        message: 'You have an interview with CloudScale DevOps Inc. scheduled for in 2 days.',
        isRead: false,
        type: 'INTERVIEW',
        link: '/student/interviews',
      },
      {
        userId: facultyUser1.id,
        title: 'New Student Application',
        message: 'Liam Patel has applied for Cybersecurity Threat Intelligence Intern.',
        isRead: true,
        type: 'APPLICATION',
        link: '/faculty/applications',
      },
    ],
  });

  console.log('✅ Applications, Interviews, Evaluations, and Feedback seeded successfully!');
  console.log('=======================================================');
  console.log('🌟 DATABASE SEED COMPLETED SUCCESSFULLY');
  console.log('=======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
