---
name: sample-command
description: |
  A sample slash command for testing platform transformations.

argument-hint: "[target] [--format=markdown] [--verbose]"
---

# Sample Command

Execute this command to test the MarsAI installer.

## Usage

```
/marsai:sample-command [target] [--format=markdown] [--verbose]
```

## Description

This command demonstrates:
- Argument parsing and validation

## Steps

1. Parse the provided arguments
2. Validate the target path
3. Process based on format option
4. Output results

## Examples

Basic usage:
```
/marsai:sample-command ./src
```

With options:
```
/marsai:sample-command ./src --format=json --verbose
```

## Related

- See also: `marsai:helper-agent`
- Related skill: `marsai:sample-skill`
