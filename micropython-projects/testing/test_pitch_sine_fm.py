"""Host-side guard against large integers in the Pico audio sample loop."""

import ast
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("pitch-sine-ch1.py")


def audio_constants():
    tree = ast.parse(SCRIPT.read_text())
    names = {}
    wanted = {
        "SAMPLE_RATE", "TABLE_SIZE", "PHASE_FRACTION_BITS",
        "PHASE_MODULUS", "MOD_SHIFT", "MOD_SCALE",
    }
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            if isinstance(target, ast.Name) and target.id in wanted:
                names[target.id] = eval(compile(ast.Expression(node.value), str(SCRIPT), "eval"), {}, names)
    return names


class FmIntegerRangeTest(unittest.TestCase):
    def test_worst_case_lfo_product_fits_pico_small_int(self):
        settings = audio_constants()
        self.assertEqual(settings["MOD_SCALE"], (1 << settings["MOD_SHIFT"]) - 1)
        phase_step = int(4_000 * settings["PHASE_MODULUS"] / settings["SAMPLE_RATE"])
        # The table sample is bounded by MOD_SCALE; Amount is at most 1.
        self.assertLessEqual(phase_step * settings["MOD_SCALE"], (1 << 30) - 1)
        self.assertLess(2 * 4_000, settings["SAMPLE_RATE"] / 2)


if __name__ == "__main__":
    unittest.main()
