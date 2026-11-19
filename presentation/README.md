# Project Presentation & Viva Preparation
## SkillBridge LMS - SEPM Capstone Project

This folder contains presentation slide decks and key technical talking points for project viva:

### Viva Quick Reference
1. **Layered Architecture**: Express routes delegate to controllers (HTTP handling/status codes), controllers call services (business logic and DB interactions).
2. **Database Normalization**: All relations are decomposed up to 3NF/BCNF. Redundancies are eliminated, referential integrity enforced via foreign keys, and indexes placed on search and foreign key columns.
3. **Security Measures**: Passwords hashed with bcrypt (salt factor 10). Authentication powered by JWT. Parameterized queries prevent SQL injection. Helmet sets HTTP security headers.
4. **State Machines**:
   - Quiz Attempts: `NOT_STARTED` -> `IN_PROGRESS` -> `SUBMITTED` -> `EVALUATED`
   - Assignment Submissions: `PENDING` -> `SUBMITTED` / `LATE` -> `GRADED`
