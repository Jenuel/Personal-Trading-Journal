from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    name="MCP Service",
    host="0.0.0.0",
    port=8050
)

@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b


if __name__ == "__main__":
    mcp.run(transport='sse')