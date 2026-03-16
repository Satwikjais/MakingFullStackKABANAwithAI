"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import { ChatSidebar } from "@/components/ChatSidebar";
import { boardApi, columnApi, cardApi, type BoardData, type ColumnData, type CardData } from "@/lib/api";

// Convert API data structure to component data structure
interface ComponentBoardData {
  id: number;
  name: string;
  columns: ComponentColumnData[];
}

interface ComponentColumnData {
  id: string;
  title: string;
  cardIds: string[];
}

interface ComponentCardData {
  id: string;
  title: string;
  details: string;
}

interface ComponentBoardState {
  columns: ComponentColumnData[];
  cards: Record<string, ComponentCardData>;
}

export const KanbanBoard = ({ userId, onLogout, onBoardUpdate }: { userId: number; onLogout: () => void; onBoardUpdate?: () => void }) => {
  const [board, setBoard] = useState<ComponentBoardState | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  // Convert API board data to component format
  const convertApiToComponent = (apiBoard: BoardData): ComponentBoardState => {
    const cards: Record<string, ComponentCardData> = {};
    const columns: ComponentColumnData[] = apiBoard.columns.map(col => {
      const cardIds = col.cards.map(card => {
        cards[card.id.toString()] = {
          id: card.id.toString(),
          title: card.title,
          details: card.details,
        };
        return card.id.toString();
      });

      return {
        id: col.id.toString(),
        title: col.title,
        cardIds,
      };
    });

    return { columns, cards };
  };

  // Load board data from API
  const loadBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardApi.getBoard(userId);
      const componentBoard = convertApiToComponent(response.board);
      setBoard(componentBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  const cardsById = useMemo(() => board?.cards || {}, [board?.cards]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id || !board) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and target columns
    const activeColumn = board.columns.find(col => col.cardIds.includes(activeId));
    const overColumn = board.columns.find(col => col.cardIds.includes(overId) || col.id === overId);

    if (!activeColumn || !overColumn) return;

    // If dropping on a column (not a card), add to end
    let targetColumnId = overColumn.id;
    let newPosition: number;

    if (overId.startsWith('col-')) {
      // Dropped on column header, add to end
      newPosition = overColumn.cardIds.length;
    } else {
      // Dropped on a card, insert at that position
      const overCardIndex = overColumn.cardIds.indexOf(overId);
      newPosition = overCardIndex;
    }

    // Optimistic update
    const sourceColumnId = activeColumn.id;
    const sourceCardIndex = activeColumn.cardIds.indexOf(activeId);

    // Remove from source
    const newSourceCardIds = [...activeColumn.cardIds];
    newSourceCardIds.splice(sourceCardIndex, 1);

    // Add to target
    const newTargetCardIds = [...overColumn.cardIds];
    newTargetCardIds.splice(newPosition, 0, activeId);

    setBoard(prev => prev ? {
      ...prev,
      columns: prev.columns.map(col => {
        if (col.id === sourceColumnId) {
          return { ...col, cardIds: newSourceCardIds };
        } else if (col.id === targetColumnId) {
          return { ...col, cardIds: newTargetCardIds };
        }
        return col;
      }),
    } : null);

    try {
      // Call API to move card
      await cardApi.moveCard(
        parseInt(activeId),
        parseInt(targetColumnId),
        newPosition
      );
    } catch (err) {
      // Revert on error
      setBoard(prev => prev ? {
        ...prev,
        columns: prev.columns.map(col => {
          if (col.id === sourceColumnId) {
            return { ...col, cardIds: activeColumn.cardIds };
          } else if (col.id === targetColumnId) {
            return { ...col, cardIds: overColumn.cardIds };
          }
          return col;
        }),
      } : null);
      setError(err instanceof Error ? err.message : 'Failed to move card');
    }
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    if (!board) return;

    // Optimistic update
    const originalTitle = board.columns.find(col => col.id === columnId)?.title;
    setBoard(prev => prev ? {
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId ? { ...col, title } : col
      ),
    } : null);

    try {
      await columnApi.updateColumn(parseInt(columnId), { title });
    } catch (err) {
      // Revert on error
      setBoard(prev => prev ? {
        ...prev,
        columns: prev.columns.map(col =>
          col.id === columnId ? { ...col, title: originalTitle || col.title } : col
        ),
      } : null);
      setError(err instanceof Error ? err.message : 'Failed to rename column');
    }
  };

  const handleAddCard = async (columnId: string, title: string, details: string) => {
    if (!board) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const position = board.columns.find(col => col.id === columnId)?.cardIds.length || 0;
    const newCard: ComponentCardData = {
      id: tempId,
      title,
      details: details || "No details yet.",
    };

    setBoard(prev => prev ? {
      ...prev,
      cards: { ...prev.cards, [tempId]: newCard },
      columns: prev.columns.map(col =>
        col.id === columnId ? { ...col, cardIds: [...col.cardIds, tempId] } : col
      ),
    } : null);

    try {
      const response = await cardApi.createCard(parseInt(columnId), title, details, position);
      // Replace temp ID with real ID
      const realId = response.card.id.toString();
      setBoard(prev => prev ? {
        ...prev,
        cards: {
          ...Object.fromEntries(
            Object.entries(prev.cards).map(([id, card]) =>
              id === tempId ? [realId, { ...card, id: realId }] : [id, card]
            )
          ),
        },
        columns: prev.columns.map(col =>
          col.id === columnId ? {
            ...col,
            cardIds: col.cardIds.map(id => id === tempId ? realId : id)
          } : col
        ),
      } : null);
    } catch (err) {
      // Revert on error
      setBoard(prev => prev ? {
        ...prev,
        cards: Object.fromEntries(
          Object.entries(prev.cards).filter(([id]) => id !== tempId)
        ),
        columns: prev.columns.map(col =>
          col.id === columnId ? {
            ...col,
            cardIds: col.cardIds.filter(id => id !== tempId)
          } : col
        ),
      } : null);
      setError(err instanceof Error ? err.message : 'Failed to add card');
    }
  };

  const handleDeleteCard = async (columnId: string, cardId: string) => {
    if (!board) return;

    // Optimistic update
    const deletedCard = board.cards[cardId];
    const columnIndex = board.columns.find(col => col.id === columnId)?.cardIds.indexOf(cardId) || 0;

    setBoard(prev => prev ? {
      ...prev,
      cards: Object.fromEntries(
        Object.entries(prev.cards).filter(([id]) => id !== cardId)
      ),
      columns: prev.columns.map(col =>
        col.id === columnId ? {
          ...col,
          cardIds: col.cardIds.filter(id => id !== cardId)
        } : col
      ),
    } : null);

    try {
      await cardApi.deleteCard(parseInt(cardId));
    } catch (err) {
      // Revert on error
      setBoard(prev => prev ? {
        ...prev,
        cards: { ...prev.cards, [cardId]: deletedCard },
        columns: prev.columns.map(col =>
          col.id === columnId ? {
            ...col,
            cardIds: [
              ...col.cardIds.slice(0, columnIndex),
              cardId,
              ...col.cardIds.slice(columnIndex)
            ]
          } : col
        ),
      } : null);
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={loadBoard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">No board data available</div>
      </div>
    );
  }

  const activeCard = activeCardId ? cardsById[activeCardId] : null;

  return (
    <div className="relative flex min-h-screen overflow-x-visible">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />
      <div className="flex flex-1">
      <main className="relative mx-auto flex-1 max-w-[1500px] flex flex-col gap-10 px-6 pb-16 pt-12">
        <header className="flex flex-col gap-6 rounded-[32px] border border-[var(--stroke)] bg-white/80 p-8 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
                Single Board Kanban
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
                Kanban Studio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
                Keep momentum visible. Rename columns, drag cards between stages,
                and capture quick notes without getting buried in settings.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
                Focus
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                One board. Five columns. Zero clutter.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
            <button
              onClick={() => setChatOpen((open) => !open)}
              className="ml-auto rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] hover:bg-gray-50 transition-colors"
            >
              Chat
            </button>
            <button
              onClick={onLogout}
              className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)] hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <section className="grid gap-6 lg:grid-cols-5">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={column.cardIds.map((cardId) => board.cards[cardId])}
                onRename={handleRenameColumn}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </section>
          <DragOverlay>
            {activeCard ? (
              <div className="w-[260px]">
                <KanbanCardPreview card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <ChatSidebar
        userId={userId}
        onBoardUpdate={onBoardUpdate || loadBoard}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
      </div>
    </div>
  );
};
