-- 1. Remove all existing faculty to start fresh
delete from faculty;

-- 2. Insert the new 5 faculty members with polished bios
insert into faculty (name, subject, qualification, experience, bio, "order", is_active)
values
(
  'Mr. Satender Singh', 
  'Founder & Lead Mentor', 
  'B.Tech (Mechanical Engineering), GATE Qualified', 
  '10+ years', 
  'Mr. Satender Singh is the Founder and Lead Mentor at Wave Academy. A GATE-qualified engineer with a B.Tech in Mechanical Engineering, he brings over 10 years of dedicated teaching experience. He has successfully mentored more than 2,500 students towards academic excellence and success in various competitive examinations. Known for his expertise, discipline, and student-focused approach, he is a highly trusted mentor among both students and parents.',
  1, 
  true
),
(
  'Adv. Sandeep Kushwaha', 
  'SSB Recommended Faculty', 
  'B.Sc., M.A. (Political Science), LL.B., B.Ed.', 
  '8+ years', 
  'Adv. Sandeep Kushwaha is a dedicated faculty member at Wave Academy with over 8 years of teaching experience. His impressive academic background includes a B.Sc., M.A. in Political Science, LL.B., and B.Ed., and he is also SSB Recommended. He has guided numerous students toward academic excellence in both school and competitive examinations. His disciplined approach and focus on conceptual clarity make him a highly respected mentor.',
  2, 
  true
),
(
  'Mrs. Akanksha Gaur', 
  'Biology (Classes 9–10)', 
  'M.Sc. Biology, B.Ed.', 
  '10+ years', 
  'Mrs. Akanksha Gaur serves as the Biology Faculty for Classes 9–10 at Wave Academy. With over 10 years of teaching experience and an M.Sc. in Biology and B.Ed., she is renowned for her clear explanations and strong conceptual teaching. She has a unique ability to make complex biological concepts easy and engaging for her students.',
  3, 
  true
),
(
  'Mr. Mayank Tripathi', 
  'Mathematics (Classes 10–11)', 
  'M.Sc. Mathematics, B.Ed.', 
  '10+ years', 
  'Mr. Mayank Tripathi is the Mathematics Faculty for Classes 10–11 at Wave Academy, bringing over 10 years of expertise. Holding an M.Sc. in Mathematics and a B.Ed., he is known for his strong conceptual approach and effective problem-solving techniques. He excels at making mathematics both manageable and high-scoring for his students.',
  4, 
  true
),
(
  'Mr. Raj Kushwaha', 
  'Chemistry (Classes 7–10)', 
  'Faculty', 
  'Dedicated Mentor', 
  'Mr. Raj Kushwaha is the Chemistry Faculty for Classes 7–10 at Wave Academy. He is dedicated to building strong fundamentals and making learning simple, engaging, and effective for every student.',
  5, 
  true
);

-- 3. Verify the update
select count(*) from faculty;
