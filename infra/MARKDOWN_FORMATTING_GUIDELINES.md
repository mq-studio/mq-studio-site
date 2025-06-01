# Markdown Formatting Guidelines

This document outlines the standards for markdown formatting in our development environment, with special attention to handling nested code blocks.

## Nested Code Blocks

When creating markdown with nested code blocks (code blocks that contain other code blocks), follow these guidelines:

### The Fence Quantity Variation Technique

1. Count the maximum consecutive backticks in the inner content
2. Use at least one more backtick in the outer delimiter
3. Ensure proper empty lines before and after the code block
4. Add language identifiers for syntax highlighting where appropriate

#### Example:

For content that contains triple backticks:

    markdown
    Here is an example of nested code:

    Three backticks followed by javascript
    const template = "This contains backticks";
    Three backticks

    Code blocks require careful nesting.
    Four backticks (closing fence)

Note: In the example above, we used four backticks for the outer fence because the inner content contains three backticks.
This ensures proper nesting according to the fence quantity variation technique.

### HTML Fallback for Complex Nesting

For more than two levels of nesting or extremely complex formatting, use HTML tags:

    <pre><code class="language-markdown">
    # Example Heading

    [Triple backticks]javascript
    const code = "backticks";
    [Triple backticks]
    </code></pre>

Note: [Triple backticks] in the example above represents triple backtick characters, which are replaced here to avoid rendering issues.

## Best Practices

1. **Use language identifiers**: Always specify the language for syntax highlighting
2. **Keep code blocks focused**: Each code block should demonstrate one concept
3. **Comment complex code**: Add comments to explain non-obvious code
4. **Escape special characters**: Use backslashes to escape special markdown characters
5. **Use consistent indentation**: Maintain consistent indentation within code blocks

## Using MCP Tools

This project provides MCP tools to help with markdown formatting:

1. **format_nested_markdown**: Formats markdown content with nested code blocks
2. **validate_markdown**: Validates markdown content for proper formatting

Example usage:

