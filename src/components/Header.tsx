import { useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import { addTodo, updateTodo, USER_ID } from '../api/todos';

interface HeaderProps {
  todos: Todo[];
  setEditingTodoId: (ids: number[]) => void;
  loadAllTodos: () => void;
  setError: (error: string) => void;
  editingTodoId: number[];
  setTodos: (todos: Todo[]) => void;
  setFilteredTodos: (todos: Todo[]) => void;
  setIsActiveFilter: (isActive: boolean) => void;
  filteredTodos: Todo[];
}

export function Header({
  todos,
  setEditingTodoId,
  setTodos,
  setFilteredTodos,
  setIsActiveFilter,
  loadAllTodos,
  filteredTodos,
  setError,
  editingTodoId,
}: HeaderProps) {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isAddingNewTodo, setIsAddingNewTodo] = useState(false);

  const inputNewTodo = useRef<HTMLInputElement>(null);

  function handleNewTodoTitle(e: React.ChangeEvent<HTMLInputElement>) {
    setNewTodoTitle(e.target.value);
  }

  async function handleAddNewTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newTodoIdAvailable = todos.length
      ? todos[todos.length - 1].id + 1
      : 1;

    const containOnlyWhiteSpaces = newTodoTitle.trim().length === 0;

    try {
      if (!newTodoTitle) {
        setError('Title should not be empty');

        return;
      }

      if (containOnlyWhiteSpaces) {
        setError('Title should not be empty');

        return;
      }

      setIsAddingNewTodo(true);
      setEditingTodoId([...editingTodoId, newTodoIdAvailable]);
      const newTodo: Todo = {
        id: newTodoIdAvailable,
        title: newTodoTitle.trim(),
        completed: false,
        userId: USER_ID,
      };

      setFilteredTodos([...todos, newTodo]);
      setIsActiveFilter(true);
      const responseFromAddedTodo = await addTodo(newTodoTitle.trim());

      setTodos([...todos, responseFromAddedTodo]);
      setFilteredTodos([...todos, responseFromAddedTodo]);

      setEditingTodoId(editingTodoId.filter(id => id !== newTodoIdAvailable));
      setNewTodoTitle('');
      setIsAddingNewTodo(false);
    } catch (er) {
      inputNewTodo.current?.focus();
      setError('Unable to add a todo');
      setEditingTodoId(editingTodoId.filter(id => id !== newTodoIdAvailable));
      setFilteredTodos(filteredTodos.filter(t => t.id !== newTodoIdAvailable));
      setIsAddingNewTodo(false);
    }
  }

  async function handleToggleAllTodos() {
    try {
      const areAllTodosCompleted = todos.every(t => t.completed);
      const areAlltodosIncomplete = todos.every(t => !t.completed);

      if (areAllTodosCompleted) {
        setEditingTodoId([...editingTodoId, ...todos.map(t => t.id)]);
        const updatedTodos = todos.map(t => ({ ...t, completed: false }));

        await Promise.all(updatedTodos.map(t => updateTodo(t)));
        setEditingTodoId([]);
        loadAllTodos();

        return;
      } else if (areAlltodosIncomplete) {
        setEditingTodoId([...editingTodoId, ...todos.map(t => t.id)]);
        const updatedTodos = todos.map(t => ({ ...t, completed: true }));

        await Promise.all(updatedTodos.map(t => updateTodo(t)));
        setEditingTodoId([]);
        loadAllTodos();

        return;
      } else {
        const todosToEdit = todos.filter(t => !t.completed);

        setEditingTodoId([...editingTodoId, ...todosToEdit.map(t => t.id)]);
        const updatedTodos = todosToEdit.map(t => ({ ...t, completed: true }));

        await Promise.all(updatedTodos.map(t => updateTodo(t)));
        setEditingTodoId([]);
        loadAllTodos();

        return;
      }
    } catch (e) {
      setError('Unable to update todo');
      setEditingTodoId([]);
      loadAllTodos();
    }
  }

  useEffect(() => {
    inputNewTodo.current?.focus();
  }, [todos.length]);

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      {todos.length > 0 && (
        <button
          type="button"
          onClick={() => handleToggleAllTodos()}
          className={`todoapp__toggle-all ${todos.every(t => t.completed) ? 'active' : ''}`}
          data-cy="ToggleAllButton"
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={e => handleAddNewTodo(e)}>
        <input
          disabled={isAddingNewTodo}
          ref={inputNewTodo}
          data-cy="NewTodoField"
          type="text"
          onChange={e => handleNewTodoTitle(e)}
          className="todoapp__new-todo"
          value={newTodoTitle}
          placeholder="What needs to be done?"
        />
      </form>
    </header>
  );
}
