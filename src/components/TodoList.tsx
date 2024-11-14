/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Todo } from '../types/Todo';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { deleteTodo, updateTodo } from '../api/todos';

interface TodoListProps {
  filteredTodos: Todo[];
  editingTodoId: number[];
  setEditingTodoId: (ids: number[]) => void;
  setError: (error: string) => void;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  setFilteredTodos: (todos: Todo[]) => void;
}
export function TodoList({
  todos,
  filteredTodos,
  editingTodoId,
  setEditingTodoId,
  setError,
  setTodos,
  setFilteredTodos,
}: TodoListProps) {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  function handleSelectedTodoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedTodo) {
      return;
    }

    setSelectedTodo({
      ...selectedTodo,
      title: e.target.value,
    });
  }

  async function handleEditTitleOfTodo(todo: Todo) {
    try {
      if (!selectedTodo) {
        throw new Error('Unable to update todo');
      }

      setEditingTodoId([...editingTodoId, todo.id]);
      const updatedTodoFromServer = await updateTodo({
        ...todo,
        title: selectedTodo.title,
      });
      const newTodos = todos.map(t =>
        t.id === todo.id ? updatedTodoFromServer : t,
      );

      setTodos(newTodos);
      setFilteredTodos(newTodos);
      setEditingTodoId(editingTodoId.filter(id => id !== todo.id));
    } catch (e) {
      setError('Unable to update a todo');
      setEditingTodoId(editingTodoId.filter(id => id !== todo.id));
    }
  }

  async function handleUpdateTodoStatus(todoId: number) {
    try {
      const todo = todos.find(t => t.id === todoId);

      setEditingTodoId([...editingTodoId, todoId]);
      if (!todo) {
        throw new Error('Todo not found');
      }

      const updatedTodo: Todo = { ...todo, completed: !todo.completed };
      const updatedTodoFromServer = await updateTodo(updatedTodo);
      const newTodos = todos.map(t =>
        t.id === todoId ? updatedTodoFromServer : t,
      );

      setEditingTodoId(editingTodoId.filter(id => id !== todoId));
      setTodos(newTodos);
      setFilteredTodos(newTodos);
    } catch (e) {
      setError('Unable to update a todo');
      setEditingTodoId(editingTodoId.filter(id => id !== todoId));
    }
  }

  async function handleRemoveTodo(todoId: number) {
    try {
      setEditingTodoId([...editingTodoId, todoId]);
      await deleteTodo(todoId);
      setEditingTodoId(editingTodoId.filter(id => id !== todoId));
      setTodos(todos.filter(t => t.id !== todoId));
      setFilteredTodos(filteredTodos.filter(t => t.id !== todoId));
    } catch (e) {
      setError('Unable to delete a todo');
      setEditingTodoId(editingTodoId.filter(id => id !== todoId));
    }
  }

  async function handleSubmitForm(
    e: React.FormEvent<HTMLFormElement>,
    todo: Todo,
  ) {
    e.preventDefault();
    if (!selectedTodo) {
      return;
    }

    if (selectedTodo && !selectedTodo.title) {
      await handleRemoveTodo(todo.id);
      setSelectedTodo(null);

      return;
    } else if (selectedTodo.title === todo.title) {
      setSelectedTodo(null);

      return;
    } else if (selectedTodo.title !== todo.title) {
      await handleEditTitleOfTodo(selectedTodo);
      setSelectedTodo(null);

      return;
    }
  }

  return (
    <TransitionGroup component={null}>
      {filteredTodos.map(todo => (
        <CSSTransition
          key={todo.id}
          timeout={300}
          classNames="item"
          unmountOnExit
          appear
          enter
          exit
        >
          <div
            data-cy="Todo"
            className={`todo ${todo.completed ? 'completed' : ''}`}
          >
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
                checked={todo.completed}
                onClick={() => handleUpdateTodoStatus(todo.id)}
              />
            </label>

            {!selectedTodo ? (
              <span
                onDoubleClick={() => setSelectedTodo(todo)}
                data-cy="TodoTitle"
                className="todo__title"
              >
                {todo.title}
              </span>
            ) : (
              <form onSubmit={e => handleSubmitForm(e, todo)}>
                <input
                  data-cy="TodoTitleField"
                  type="text"
                  className="todo__title-field"
                  onChange={handleSelectedTodoChange}
                  placeholder="Empty todo will be deleted"
                  onBlur={e =>
                    handleSubmitForm(
                      e as unknown as React.FormEvent<HTMLFormElement>,
                      todo,
                    )
                  }
                  value={selectedTodo.title}
                />
              </form>
            )}

            {/* Remove button appears only on hover */}
            <button
              onClick={() => handleRemoveTodo(todo.id)}
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
            >
              ×
            </button>

            {/* overlay will cover the todo while it is being deleted or updated */}
            <div
              data-cy="TodoLoader"
              className={`modal overlay ${editingTodoId.includes(todo.id) ? 'is-active' : ''}`}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}
