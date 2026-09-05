# QA Strategy: Arogya Connect

## 1. Principles
1. **Security First**: Frontend validation is strictly for UX. Backend validation is mandatory for data integrity and security.
2. **Object-Level Authorization (IDOR)**: The backend must explicitly verify that the authenticated identity is authorized to mutate/view the specific object ID provided in the request payload or URL parameter.
3. **Automated Regression**: When a bug is discovered, a regression test must be added to prevent its recurrence.
4. **End-to-End Workflow Testing**: Do not test isolated API endpoints without testing the full journey (Frontend click → React State → Backend Auth → DB Mutation → Frontend Render).
5. **No Synthetic Shortcuts**: Use strong passwords, actual roles, and isolated datasets for testing. 

## 2. QA Test Matrix
Maintained in `docs/QA_TEST_MATRIX.md`. This maps Roles to Workflow Permissions.

## 3. Bug Regression Log
Maintained in `docs/BUG_REGRESSION_LOG.md`. Contains historical issues, their fixes, and the linked regression test.
