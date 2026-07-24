# LeetCode Java

Java solutions with local testing and debugging.

## Usage

**Run a specific question:**
```powershell
.\run.ps1 -num 1        # run Question1
java Runner 1            # or directly
```

**Run a single file in IDEA:**
Right-click → Run `QuestionN.main()`

## Add a new question

1. Copy `Template.java` → `QuestionN.java`
2. Rename class to `QuestionN`
3. Write solution in `static class Solution`
4. Add test cases in `run()`
5. Register in `Runner.java`:
   ```java
   case N -> QuestionN.run();
   ```

## Files

| File | Description |
|---|---|
| `QuestionN.java` | Solution + test cases |
| `Runner.java`    | Central launcher |
| `Template.java`  | Copy this for new questions |
| `run.ps1`        | Compile & run script |