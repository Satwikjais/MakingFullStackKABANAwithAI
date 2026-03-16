import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";
import { vi } from "vitest";

// Mock the API
vi.mock("@/lib/api", () => ({
  boardApi: {
    getBoard: vi.fn().mockResolvedValue({
      board: {
        id: 1,
        name: "Test Board",
        user_id: 1,
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
        columns: [
          {
            id: 1,
            title: "To Do",
            position: 0,
            board_id: 1,
            created_at: "2023-01-01",
            updated_at: "2023-01-01",
            cards: []
          },
          {
            id: 2,
            title: "In Progress",
            position: 1,
            board_id: 1,
            created_at: "2023-01-01",
            updated_at: "2023-01-01",
            cards: []
          },
          {
            id: 3,
            title: "Done",
            position: 2,
            board_id: 1,
            created_at: "2023-01-01",
            updated_at: "2023-01-01",
            cards: []
          }
        ]
      }
    })
  },
  columnApi: {
    updateColumn: vi.fn().mockResolvedValue({ column: {} })
  },
  cardApi: {
    createCard: vi.fn().mockResolvedValue({ card: { id: 1, title: "New card", details: "Notes", position: 0, column_id: 1 } }),
    deleteCard: vi.fn().mockResolvedValue({})
  }
}));

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

describe("KanbanBoard", () => {
  it("renders columns", async () => {
    await act(async () => {
      render(<KanbanBoard userId={1} onLogout={() => {}} />);
    });
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(3);
  });

  it("renames a column", async () => {
    await act(async () => {
      render(<KanbanBoard userId={1} onLogout={() => {}} />);
    });
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
  });

  it("adds and removes a card", async () => {
    await act(async () => {
      render(<KanbanBoard userId={1} onLogout={() => {}} />);
    });
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByText("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });
});
