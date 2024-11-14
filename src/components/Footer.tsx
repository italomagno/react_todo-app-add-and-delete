import { useState } from 'react';
import { deleteTodo } from '../api/todos';
import { Todo } from '../types/Todo';

export interface FooterProps {
  todos: Todo[];
  isActiveFilter: boolean;
  setEditingTodoId: (ids: number[]) => void;
  loadAllTodos: () => void;
  setError: (error: string) => void;
  editingTodoId: number[];
  setFilteredTodos: (todos: Todo[]) => void;
}
export function Footer({
  todos,
  isActiveFilter,
  setEditingTodoId,
  loadAllTodos,
  setError,
  editingTodoId,
  setFilteredTodos,
}: FooterProps) {
  const [filter, setFilter] = useState('all');

  async function handleFilterTodos(filterString: string) {
    setFilter(filterString);
    switch (filterString) {
      case 'all':
        setFilteredTodos(todos);
        break;
      case 'active':
        setFilteredTodos(todos.filter(t => !t.completed));
        break;
      case 'completed':
        setFilteredTodos(todos.filter(t => t.completed));
        break;
      default:
        setFilteredTodos(todos);
    }
  }

  async function handleDeleteAllCompletedTodos() {
    const completedTodos = todos.filter(t => t.completed);
    const completedTodoIds = completedTodos.map(t => t.id);

    try {
      setEditingTodoId([...editingTodoId, ...completedTodoIds]);
      await Promise.all(completedTodos.map(t => deleteTodo(t.id)));
    } catch (e) {
      setError('Unable to delete a todo');
    }

    setEditingTodoId(
      editingTodoId.filter(id => !completedTodoIds.includes(id)),
    );
    loadAllTodos();
  }

  return (
    <>
      {isActiveFilter && (
        <footer className="todoapp__footer" data-cy="Footer">
          <span className="todo-count" data-cy="TodosCounter">
            {`${todos.filter(t => !t.completed).length} items left`}
          </span>

          {/* Active link should have the 'selected' class */}
          <nav className="filter" data-cy="Filter">
            <a
              onClick={() => handleFilterTodos('all')}
              href="#/"
              className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
              data-cy="FilterLinkAll"
            >
              All
            </a>

            <a
              onClick={() => handleFilterTodos('active')}
              href="#/active"
              className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
              data-cy="FilterLinkActive"
            >
              Active
            </a>

            <a
              onClick={() => {
                handleFilterTodos('completed');
              }}
              href="#/completed"
              className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
              data-cy="FilterLinkCompleted"
            >
              Completed
            </a>
          </nav>

          {/* this button should be disabled if there are no completed todos */}
          {todos.some(t => t.completed) && (
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleDeleteAllCompletedTodos}
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </>
  );
}
