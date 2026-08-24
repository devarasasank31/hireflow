-- =============================================
-- ENTER RECRUITMENT - SEED DATA
-- 10 Realistic Jobs
-- =============================================

INSERT INTO jobs (id, title, location, employment_type, description, is_active) VALUES
  (uuid_generate_v4(), 'Java Backend Developer', 'Bangalore, India', 'Full-time', 'Design and develop scalable backend services using Java and Spring Boot. Work with microservices architecture, REST APIs, and database optimization. Collaborate with frontend teams to deliver end-to-end features.', true),
  (uuid_generate_v4(), 'Full Stack Developer', 'Hyderabad, India', 'Full-time', 'Build and maintain web applications from frontend to backend. Proficiency in React/Next.js and Node.js/Python required. Experience with databases, CI/CD pipelines, and cloud deployment preferred.', true),
  (uuid_generate_v4(), 'React Developer', 'Pune, India', 'Full-time', 'Develop responsive and performant user interfaces using React and TypeScript. Work closely with designers and backend engineers. Strong understanding of state management and modern CSS.', true),
  (uuid_generate_v4(), 'AI/ML Engineer', 'Bangalore, India', 'Full-time', 'Develop and deploy machine learning models for production use cases. Experience with Python, TensorFlow/PyTorch, and MLOps tools. Strong math and statistics background required.', true),
  (uuid_generate_v4(), 'Python Developer', 'Remote, India', 'Full-time', 'Write clean, efficient Python code for data processing pipelines and web services. Experience with Django/FastAPI, SQL databases, and RESTful API design required.', true),
  (uuid_generate_v4(), 'DevOps Engineer', 'Chennai, India', 'Full-time', 'Manage and optimize CI/CD pipelines, container orchestration, and cloud infrastructure. Proficiency in Docker, Kubernetes, AWS/GCP, and Terraform required.', true),
  (uuid_generate_v4(), 'Cloud Engineer', 'Mumbai, India', 'Full-time', 'Design, implement, and maintain cloud-based infrastructure. Experience with AWS or GCP services, serverless architectures, and infrastructure as code required.', true),
  (uuid_generate_v4(), 'Software Engineer', 'Noida, India', 'Full-time', 'Develop high-quality software solutions across the stack. Strong CS fundamentals, problem-solving skills, and experience with modern development practices required.', true),
  (uuid_generate_v4(), 'Data Engineer', 'Bangalore, India', 'Full-time', 'Build and maintain data pipelines and ETL processes. Experience with SQL, Python, Apache Spark/Airflow, and data warehousing solutions required.', true),
  (uuid_generate_v4(), 'QA Automation Engineer', 'Hyderabad, India', 'Internship', 'Design and execute automated test plans for web applications. Experience with Selenium, Cypress, or Playwright. Strong attention to detail and scripting skills required.', true);
