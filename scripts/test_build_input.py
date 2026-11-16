import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


spec = importlib.util.spec_from_file_location('build_input_reader', Path(__file__).with_name('read-build-input.py'))
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


class BuildInputReaderTests(unittest.TestCase):
    def test_component_and_content_boundaries(self):
        runs = Path(__file__).resolve().parents[1] / '.ai-work/runs'
        runs.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='build-input-reader-', dir=runs) as temporary:
            root = Path(temporary).resolve()
            vendor = root / 'sdk'
            vendor.mkdir()
            target = vendor / 'CANONICAL.json'
            original = json.dumps({'commit': 'a' * 40}).encode()
            target.write_bytes(original)
            self.assertEqual(reader.read_build_input(str(target)), original)
            outside = root / 'outside'
            outside.mkdir()
            alternate = outside / target.name
            alternate.write_text(json.dumps({'commit': 'b' * 40}))
            saved = root / 'saved-sdk'
            open_original = os.open
            swapped = False

            def swap_ancestor(component, flags, *arguments, **keywords):
                nonlocal swapped
                if component != target.name or swapped:
                    return open_original(component, flags, *arguments, **keywords)
                swapped = True
                vendor.rename(saved)
                vendor.symlink_to(outside, target_is_directory=True)
                try:
                    return open_original(component, flags, *arguments, **keywords)
                finally:
                    vendor.unlink()
                    saved.rename(vendor)

            with patch.object(reader.os, 'open', side_effect=swap_ancestor) as opener:
                with patch.object(reader.os, 'supports_dir_fd', {opener}):
                    self.assertEqual(reader.read_build_input(str(target)), original)
            self.assertTrue(swapped, 'The ancestor substitution must actually run')
            target.unlink()
            target.symlink_to(alternate)
            with self.assertRaises(OSError):
                reader.read_build_input(str(target))
            target.unlink()
            os.mkfifo(target)
            with self.assertRaisesRegex(ValueError, 'bounded and regular'):
                reader.read_build_input(str(target))
            target.unlink()
            target.mkdir()
            with self.assertRaisesRegex(ValueError, 'bounded and regular'):
                reader.read_build_input(str(target))


if __name__ == '__main__':
    unittest.main()
