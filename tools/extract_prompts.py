"""Claude Code 세션 기록에서 내가 입력한 프롬프트만 뽑아 마크다운으로 저장한다.

보고서 3장(핵심 프롬프트 3건, 프롬프트 개선 사례)을 쓸 때
"실제 입력한 문장 그대로" 옮기기 위해 사용한다.

실행: python tools/extract_prompts.py
결과: my_prompts.md (저장소에 커밋하지 않음)
"""

import json
import os
from pathlib import Path

OUTPUT_FILE = "my_prompts.md"


# Claude Code가 세션 기록을 저장하는 폴더를 찾는다
def find_project_dirs():
  base = Path.home() / ".claude" / "projects"
  if not base.exists():
    return []
  return [d for d in base.iterdir() if d.is_dir()]


# 세션 파일 한 개에서 사용자가 입력한 프롬프트만 읽어온다
def read_prompts(jsonl_path):
  prompts = []
  with open(jsonl_path, "r", encoding="utf-8") as f:
    for line in f:
      try:
        record = json.loads(line)
      except json.JSONDecodeError:
        continue
      if record.get("type") != "user":
        continue
      content = record.get("message", {}).get("content")
      # 문자열이 아닌 것(도구 결과)과 시스템이 끼워넣은 내용은 제외한다
      if isinstance(content, str) and content.strip() and not content.startswith("<"):
        prompts.append(content.strip())
  return prompts


# 모든 세션의 프롬프트를 모아 마크다운 파일로 저장한다
def main():
  project_dirs = find_project_dirs()
  if not project_dirs:
    print("세션 기록 폴더를 찾지 못했습니다: ~/.claude/projects")
    return

  sections = []
  total = 0
  for project_dir in project_dirs:
    for jsonl_path in sorted(project_dir.glob("*.jsonl")):
      prompts = read_prompts(jsonl_path)
      if not prompts:
        continue
      sections.append(f"## {project_dir.name} / {jsonl_path.stem}\n")
      for prompt in prompts:
        total += 1
        sections.append(f"### 프롬프트 {total}\n\n{prompt}\n")

  with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("# 내가 입력한 프롬프트 기록\n\n")
    f.write("\n".join(sections))

  print(f"프롬프트 {total}건을 {OUTPUT_FILE} 에 저장했습니다.")


if __name__ == "__main__":
  main()
