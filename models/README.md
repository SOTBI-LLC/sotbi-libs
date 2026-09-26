# models

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build models` to build the library.

## Motivation special criteria catalog (BH-1851)

The Motivation models mirror `sotbisrv/api/openapi/motivation.yaml`. Since
BH-1851 the evaluation catalog is split in two:

- `BaseCriteria` applies to every position (unchanged resource);
- `Criterion` is one special criterion scoped to exactly one external
  position. `positionId` is an exact decimal string (`DecimalInt64`) and is
  immutable, as are `maxScore` and `validFrom`. Only `name`, `description`
  and `validTo` can change after creation.

Frozen snapshot and sheet lines (`PeriodCriterion`, `SheetCriterion`) carry a
discriminated `type: 'base' | 'special'` plus the matching single source
(`baseCriteriaId` or `criterionId`) and the special-only frozen `positionId`.

Patch types (`UpdateBaseCriteriaRequest`, `UpdateCriterionRequest`) contain
only `name`, `description`, `validTo` by design: the server rejects structural
fields with HTTP 400, so they have no representation in the patch types. A
compile-time contract check lives in `motivation.type-check.ts`.

Client methods (`@sotbi/data-access` `MotivationApiService`):
`createCriterion`, `updateCriterion`, `getCriterion`, `listCriteria`,
`listMotivationPositions` (admin-only position choices). Every mutation keeps
the unchanged `Idempotency-Key` contract.
