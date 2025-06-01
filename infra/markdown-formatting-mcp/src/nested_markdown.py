def count_max_backticks(content):
    """Count maximum consecutive backticks in content

    Args:
        content (str): The content to analyze
        
    Returns:
        int: Maximum number of consecutive backticks found
    """
    max_count = 0
    current_count = 0
    
    for char in content:
        if char == '`':
            current_count += 1
            max_count = max(max_count, current_count)
        else:
            current_count = 0
    
    return max_count

def format_nested_code(content, language=''):
    """Format code block with proper backtick fencing

    Args:
        content (str): The code content to format
        language (str, optional): Language identifier for syntax highlighting
        
    Returns:
        str: The formatted code block with appropriate fencing
    """
    # Count maximum consecutive backticks in the content
    max_backticks = count_max_backticks(content)
    
    # Determine the number of backticks needed for the outer fence
    # Use at least 3 backticks, or max_backticks + 1 if content has backticks
    fence_length = max(3, max_backticks + 1)
    
    # Create the fence with the appropriate number of backticks
    fence = '`' * fence_length
    
    # Build the formatted code block
    formatted_block = ''
    
    # Add opening fence with language
    formatted_block += fence + language + '\n'
    
    # Add content
    formatted_block += content + '\n'
    
    # Add closing fence
    formatted_block += fence
    
    return formatted_block

def generate_markdown_doc(title, sections):
    """Generate a properly formatted markdown document with multiple code blocks

    Args:
        title (str): Document title
        sections (list): List of dicts with headings, text, and code blocks
        
    Returns:
        str: Formatted markdown document
    """
    document = f'# {title}\n\n'
    
    for section in sections:
        # Add section heading
        document += f"## {section.get('heading', 'Section')}\n\n"
        
        # Add text if provided
        if section.get('text'):
            document += f"{section['text']}\n\n"
        
        # Add code block if provided
        if section.get('code'):
            document += format_nested_code(
                section['code'],
                section.get('language', '')
            ) + '\n\n'
    
    return document

