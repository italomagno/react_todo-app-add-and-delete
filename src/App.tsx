import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorComponent } from './components/ErrorComponent';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number[]>([]);
  const [isActiveFilter, setIsActiveFilter] = useState(false);

  async function loadAllTodos() {
    try {
      const loadedTodos = await getTodos();

      if (loadedTodos.length > 0) {
        setIsActiveFilter(true);
      }

      setTodos(loadedTodos);
      setFilteredTodos(loadedTodos);
    } catch (e) {
      setError('Unable to load todos');
    }
  }

  useEffect(() => {
    loadAllTodos();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, [error]);

  useEffect(() => {
    if (todos.length === 0) {
      setIsActiveFilter(false);
    }
  }, [todos.length]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          todos={todos}
          setEditingTodoId={setEditingTodoId}
          loadAllTodos={loadAllTodos}
          setError={setError}
          editingTodoId={editingTodoId}
          setTodos={setTodos}
          setFilteredTodos={setFilteredTodos}
          setIsActiveFilter={setIsActiveFilter}
          filteredTodos={filteredTodos}
        />
        <section className="todoapp__main" data-cy="TodoList">
          <TodoList
            filteredTodos={filteredTodos}
            editingTodoId={editingTodoId}
            setEditingTodoId={setEditingTodoId}
            loadAllTodos={loadAllTodos}
            setError={setError}
            todos={todos}
            setTodos={setTodos}
            setFilteredTodos={setFilteredTodos}
          />
        </section>
        <Footer
          setFilteredTodos={setFilteredTodos}
          todos={todos}
          isActiveFilter={isActiveFilter}
          setEditingTodoId={setEditingTodoId}
          loadAllTodos={loadAllTodos}
          setError={setError}
          editingTodoId={editingTodoId}
        />
      </div>

      <ErrorComponent error={error} setError={setError} />
    </div>
  );
};
