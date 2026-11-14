# FDRGuard
### Streamline of security deposit or FDR portal

**A centralized platform for managing, verifying, monitoring, and tracking institutional Fixed Deposit Receipts (FDRs).**

## SIH 2026 Project Details

| Field | Details |
|---|---|
| Hackathon | Smart India Hackathon 2026 |
| Team Name | TrustNexus_005 |
| Team ID | 199473 |
| Problem Statement ID | SIH26265 |
| Problem Statement Title | Streamline of security deposit or FDR portal |
| Theme | Smart Automation |
| PS Category | Software |

## Live Deployment

**Application:** [fdrguard-sih26265.vercel.app](https://fdrguard-sih26265.vercel.app)

---

## 1. Project Overview

FDRGuard is a digital platform designed to simplify the management of institutional security deposits and Fixed Deposit Receipts (FDRs). It provides a centralized workspace to manage FDR records throughout their lifecycle, from initial submission and document verification to maturity monitoring, renewal, replacement, and release requests.

The platform combines document processing, automated compliance monitoring, anomaly indicators, role-based access, and audit tracking to improve transparency and reduce manual administrative effort.

## 2. Problem Statement

Educational institutions are required to maintain security deposits and FDRs as part of regulatory and approval-related compliance processes. However, managing these records through spreadsheets, emails, scanned documents, and disconnected systems can create several challenges:

- Difficulty maintaining centralized institution-wise FDR records.
- Manual tracking of FDR validity and maturity dates.
- Delays in identifying expired or approaching-maturity deposits.
- Challenges in verifying information across submitted documents.
- Difficulty tracking renewal, replacement, and release requests.
- Limited visibility into pending verification and compliance activities.
- Lack of a consolidated record of actions and document changes.

These challenges can increase administrative workload and make compliance monitoring less efficient.

## 3. Proposed Solution

FDRGuard addresses these challenges through a centralized FDR lifecycle management platform.

Institutions can submit FDR information and supporting documents, while authorized officials can review submissions, examine discrepancies, monitor compliance status, and process relevant requests.

The platform uses OCR-assisted document extraction, rule-based validation, document fingerprinting, lifecycle alerts, and anomaly indicators to support the verification and monitoring process.

FDRGuard supports decision-making and human review. It does not automatically declare an FDR fraudulent or replace authorized verification by officials or banks.

## 4. Key Features

### 4.1 Centralized FDR Management

- Maintain institution-wise FDR records.
- Store details such as FDR number, issuing bank, amount, issue date, and maturity date.
- Track the current status of each FDR.
- Access relevant records through role-based dashboards.

### 4.2 OCR-Assisted Document Verification

- Extract relevant information from uploaded FDR documents.
- Compare extracted values with institution-entered information.
- Highlight missing, inconsistent, or mismatched details.
- Support manual review of flagged discrepancies.

### 4.3 Document Fingerprinting

- Generate SHA-256 fingerprints for uploaded files.
- Identify identical files submitted under different filenames.
- Support file-integrity checks by comparing document fingerprints.

SHA-256 fingerprinting helps identify identical files and detect file changes; it does not independently establish whether an FDR is genuine.

### 4.4 Cross-Institution Anomaly Detection

- Identify unusual similarities across FDR records.
- Highlight repeated references or similar submission patterns.
- Provide indicators for further investigation by authorized officials.

Anomaly indicators are intended for human review and are not automatic proof of fraud.

### 4.5 FDR Lifecycle Monitoring

- Monitor FDR validity and maturity dates.
- Identify approaching-maturity and overdue records.
- Generate reminders and compliance alerts.
- Track renewal and replacement activities.
- Maintain links between original and renewed or replacement FDR records.

### 4.6 Release and Refund Workflow

- Allow institutions to submit release or refund requests.
- Support verification and approval stages.
- Track request status and review observations.
- Maintain a record of decisions and related actions.

### 4.7 Rule-Based Risk Prioritization

- Highlight records with approaching maturity dates.
- Identify overdue renewals and pending verification.
- Surface document discrepancies and missing information.
- Prioritize records that may require timely attention.

### 4.8 Digital Evidence and Audit Tracking

- Maintain uploaded documents and relevant document versions.
- Record important user actions and status changes.
- Use timestamped, hash-linked audit events to support tamper-evident tracking.
- Improve traceability of verification and approval activities.

### 4.9 Security Monitoring

- Provide role-based access control.
- Monitor selected security-related events.
- Support administrative visibility into unusual access activity.
- Restrict access to relevant records and operations based on user roles.

### 4.10 Centralized Dashboard and Reports

- View active, pending, matured, and overdue FDR records.
- Monitor upcoming maturity dates and release requests.
- Filter records by institution, bank, status, and other relevant fields.
- Present compliance information through dashboards and reports.

## 5. System Workflow

```text
Institution Registration
          |
          v
FDR Details Submission
          |
          v
Supporting Document Upload
          |
          v
OCR-Based Data Extraction
          |
          v
Data Comparison and Validation
          |
          v
Anomaly Indicators and Risk Prioritization
          |
          v
Authorized Officer Review
          |
          v
Verification and Status Update
          |
          v
Lifecycle Monitoring and Alerts
          |
          v
Renewal / Replacement / Release
          |
          v
Audit Tracking and Reporting
```

## 6. Innovation and Uniqueness

FDRGuard focuses on managing an FDR as a continuously monitored compliance record rather than treating it as a one-time document submission.

Its key differentiating aspects include:

- **Lifecycle-Centric Management:** Connects submission, verification, monitoring, renewal, replacement, and release activities.
- **Document Intelligence:** Uses OCR-assisted extraction and comparison to reduce repetitive manual checking.
- **Cross-Institution Analysis:** Highlights unusual similarities across records for further examination.
- **Compliance Timeline Monitoring:** Helps identify approaching deadlines and overdue actions.
- **Traceable Record Management:** Maintains document fingerprints and hash-linked audit events.
- **Human-in-the-Loop Verification:** Keeps important verification and approval decisions with authorized officials.

## 7. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, TypeScript |
| UI and Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| OCR and Document Processing | EasyOCR, OpenCV, PyMuPDF |
| Data Analysis | Python, Scikit-learn |
| Document Integrity | SHA-256 |
| Authentication | JWT, Role-Based Access Control |
| API Communication | REST APIs |
| Version Control | Git, GitHub |
| Deployment | Vercel, Render |

## 8. User Roles

- **Institution Administrator:** Submits FDR details, uploads documents, views records, and raises renewal or release requests.
- **Verification Officer:** Reviews submitted information, examines discrepancies, and updates verification status.
- **Platform Administrator:** Manages platform-level settings, users, monitoring, and administrative activities.

## 9. Impact

FDRGuard aims to:

- Reduce manual effort in FDR record management.
- Improve visibility into FDR validity and maturity.
- Support timely renewal and replacement activities.
- Make document discrepancies easier to identify.
- Improve tracking of release and refund requests.
- Strengthen accountability through traceable records.
- Support more organized and transparent compliance monitoring.

## 10. Security and Data Integrity

The platform incorporates security-oriented practices such as:

- Role-based access control.
- Authenticated access to platform features.
- SHA-256 document fingerprinting.
- Controlled document access.
- Timestamped, hash-linked audit events.
- Monitoring of selected security-related activities.

These mechanisms support security and traceability but do not independently guarantee the authenticity of bank-issued documents.

## 12. Prototype Scope

The project prototype demonstrates the proposed FDR management and compliance workflow through its implemented modules.

External bank verification and integration with existing regulatory systems should be treated as future integrations unless an authorized working connection is available.

## 13. References

- [Reserve Bank of India (RBI)](https://www.rbi.org.in/)
- [National Institute of Standards and Technology (NIST)](https://www.nist.gov/)
- [NIST Secure Hash Standard – FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
- [OWASP Foundation](https://owasp.org/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

## 14. Project Information

**Project Name:** FDRGuard  
**Project Category:** Compliance Management / Document Intelligence  
**Project Focus:** Institutional FDR Lifecycle Management

---

**FDRGuard — Bringing transparency, traceability, and smarter monitoring to institutional FDR management.**
