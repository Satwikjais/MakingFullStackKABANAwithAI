import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatSidebar } from "./ChatSidebar";

// Mock fetch
globalThis.fetch = vi.fn();

describe("ChatSidebar", () => {
  const mockOnBoardUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chat interface", () => {
    render(<ChatSidebar userId={1} onBoardUpdate={mockOnBoardUpdate} open={false} onClose={function (): void {
      throw new Error("Function not implemented.");
    } } />);
    
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask me to create a card...")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("sends message and displays response", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Card created!", actions: [] }),
    });

    render(<ChatSidebar userId={1} onBoardUpdate={mockOnBoardUpdate} open={false} onClose={function (): void {
      throw new Error("Function not implemented.");
    } } />);
    
    const input = screen.getByPlaceholderText("Ask me to create a card...");
    const sendButton = screen.getByText("Send");
    
    fireEvent.change(input, { target: { value: "Create a test card" } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText("Create a test card")).toBeInTheDocument();
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Card created!")).toBeInTheDocument();
    });
    
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        user_id: 1,
        prompt: "Create a test card",
        history: [{ role: "user", content: "Create a test card" }],
      }),
    }));
  });

  it("handles API error", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "API Error" }),
    });

    render(<ChatSidebar userId={1} onBoardUpdate={mockOnBoardUpdate} open={false} onClose={function (): void {
      throw new Error("Function not implemented.");
    } } />);
    
    const input = screen.getByPlaceholderText("Ask me to create a card...");
    const sendButton = screen.getByText("Send");
    
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText("Error: API Error")).toBeInTheDocument();
    });
  });

  it("calls onBoardUpdate when actions are returned", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Done", actions: [{ type: "create_card" }] }),
    });

    render(<ChatSidebar userId={1} onBoardUpdate={mockOnBoardUpdate} open={false} onClose={function (): void {
      throw new Error("Function not implemented.");
    } } />);
    
    const input = screen.getByPlaceholderText("Ask me to create a card...");
    const sendButton = screen.getByText("Send");
    
    fireEvent.change(input, { target: { value: "Create card" } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnBoardUpdate).toHaveBeenCalled();
    });
  });
});


