from quart import url_for


async def static(location: str = None, filename: str = None) -> str | None:
    """Custom static implementation that accepts routes for other static locations

    Args:
        location (str, optional): Endpoint/folder to search in. Default: None (current template's folder)
        filename (str, optional): Default: None (causes this function to return None)

    Returns:
        str: URL to a given file, if it exists
    """
    if filename is None:
        return None

    if location is not None:
        return url_for(f"{location}.static", filename=filename)
    return url_for("static", filename=filename)
