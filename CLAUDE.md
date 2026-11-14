# Jewelleray - UAE Jewellery Photography Platform

## Overview
A UAE-focused B2B/B2C web platform allowing jewellery retailers to upload ONE smartphone photo of a piece, choose metal karat, backdrop style, and optional UAE buyer persona framing, and receive catalog-grade images in minutes.

- **Owner:** Mayank (Micky), Dubai, UAE (GST / UTC+4)
- **Brand Config:** Centered in `src/config/brand.ts` (`BRAND_NAME = "BRAND"`)
- **Currency:** AED (All user pricing VAT-inclusive, with 5% UAE VAT itemized)

## Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Unit/Integration Tests: `npm test`
- E2E Tests: `npm run test:e2e`
- Benchmark: `npm run benchmark`

## Key Architecture Principles
1. **Append-Only Credit Ledger:** `credit_ledger` with `idempotency_key` (balance = SUM(delta)). Never mutable balance.
2. **Provider Adapter Pattern:** Clean interfaces for `ImageProvider`, `PaymentProvider`, `MessagingProvider`.
3. **Zero Paid APIs in Dev/Test:** Default to `MockProvider` implementations.
4. **Fidelity Gate:** Silhouette IoU + Karat Color Drift (LAB/HSV) before `done` state.
5. **Bilingual RTL/LTR:** Arabic (`ar`, default for UAE) + English (`en`).
