/**
 * Write `public/ambient/camera-contract.json` from the measured hero calibration.
 *
 *     npm run export:camera-contract
 *
 * The contract is generated rather than written by hand, for the same reason the chatbot generates
 * its own: it is the only thing 3D-Ambience-Studio knows about this page's composition, and a
 * hand-maintained copy of a measurement drifts silently — the art still generates, it just no
 * longer fits. `tests/camera-contract.test.ts` rebuilds it and fails if the committed copy has
 * drifted, so re-measuring the hero without re-exporting cannot reach a commit.
 *
 * The derivation lives in `tools/cameraContract.ts`, which has no side effects so the test can
 * import it.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cameraContract } from './cameraContract';

const output = resolve(process.cwd(), 'public/ambient/camera-contract.json');
writeFileSync(output, `${JSON.stringify(cameraContract, null, 2)}\n`, 'utf8');
process.stdout.write(`wrote ${output}\n`);
