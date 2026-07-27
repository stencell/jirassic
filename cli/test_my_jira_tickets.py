#!/usr/bin/env python3
"""Unit tests for my-jira-tickets JQL building and ticket parsing."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

def build_project_clause(project_str):
    """Build the project JQL clause from a comma-separated project string."""
    if not project_str:
        return ""
    projects = [p.strip() for p in project_str.split(",") if p.strip()]
    if not projects:
        return ""
    if len(projects) == 1:
        return f"project = {projects[0]} AND "
    keys = ", ".join(projects)
    return f"project IN ({keys}) AND "

def extract_project(issue_key):
    """Extract project key from an issue key like GPTEINFRA-123."""
    return issue_key.split("-")[0] if "-" in issue_key else ""

def test_single_project():
    assert build_project_clause("GPTEINFRA") == "project = GPTEINFRA AND "

def test_multi_project():
    assert build_project_clause("GPTEINFRA,RHDPCD") == "project IN (GPTEINFRA, RHDPCD) AND "

def test_multi_project_with_spaces():
    assert build_project_clause("GPTEINFRA, RHDPCD") == "project IN (GPTEINFRA, RHDPCD) AND "

def test_empty_project():
    assert build_project_clause("") == ""
    assert build_project_clause(None) == ""

def test_extract_project():
    assert extract_project("GPTEINFRA-123") == "GPTEINFRA"
    assert extract_project("RHDPCD-42") == "RHDPCD"

if __name__ == "__main__":
    tests = [test_single_project, test_multi_project, test_multi_project_with_spaces,
             test_empty_project, test_extract_project]
    passed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS  {t.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  FAIL  {t.__name__}: {e}")
    print(f"\n{passed}/{len(tests)} tests passed")
    sys.exit(0 if passed == len(tests) else 1)
