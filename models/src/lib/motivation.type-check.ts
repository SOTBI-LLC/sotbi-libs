import type {
  Criterion,
  PositionChoice,
  UpdateBaseCriteriaRequest,
  UpdateCriterionRequest,
} from './motivation';

/**
 * Compile-time contract checks for the BH-1851 catalog split. Nothing here is
 * emitted at runtime; the file fails `tsc` when the public types drift:
 * - position identifiers stay decimal strings, never numbers;
 * - patch types never grow structural fields (maxScore, validFrom,
 *   positionId, type).
 */
type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type HasKey<T, K extends string> = K extends keyof T ? true : false;

// Position provenance is stringly typed for exactness above 2^53.
type _CriterionPositionIsString = Expect<Equal<Criterion['positionId'], string>>;
type _ChoiceIdIsString = Expect<Equal<PositionChoice['id'], string>>;

// Patch types carry only the mutable trio.
type _BasePatchNoMaxScore = Expect<Equal<HasKey<UpdateBaseCriteriaRequest, 'maxScore'>, false>>;
type _BasePatchNoValidFrom = Expect<Equal<HasKey<UpdateBaseCriteriaRequest, 'validFrom'>, false>>;
type _BasePatchNoPositionId = Expect<
  Equal<HasKey<UpdateBaseCriteriaRequest, 'positionId'>, false>
>;
type _SpecialPatchNoPositionId = Expect<
  Equal<HasKey<UpdateCriterionRequest, 'positionId'>, false>
>;
type _SpecialPatchNoMaxScore = Expect<Equal<HasKey<UpdateCriterionRequest, 'maxScore'>, false>>;
type _SpecialPatchNoType = Expect<Equal<HasKey<UpdateCriterionRequest, 'type'>, false>>;

// The presence markers below are never evaluated; they exist so the type
// aliases above cannot be tree-shaken away by careless refactors.
export type BH_1851_CONTRACT_CHECKS = [
  _CriterionPositionIsString,
  _ChoiceIdIsString,
  _BasePatchNoMaxScore,
  _BasePatchNoValidFrom,
  _BasePatchNoPositionId,
  _SpecialPatchNoPositionId,
  _SpecialPatchNoMaxScore,
  _SpecialPatchNoType,
];
