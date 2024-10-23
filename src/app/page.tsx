"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  getColumns,
  getTasks,
  createColumn,
  createTask,
  updateTask,
  deleteTask,
  deleteColumn,
} from "@/services/api";
import { useRouter } from "next/navigation";
import TaskFormModal from "@/components/TaskFormModal";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import SearchBar from "@/components/SearchBar";

interface Column {
  _id: string;
  title: string;
  order: number;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  column: string | { _id: string; title: string; order: number; user: string };
  user: string;
  createdAt: string;
}

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchColumnsAndTasks();
    }
  }, [router]);

  useEffect(() => {
    console.log("Tasks updated:", tasks);
  }, [tasks]);

  const fetchColumnsAndTasks = async () => {
    try {
      const [columnsResponse, tasksResponse] = await Promise.all([
        getColumns(),
        getTasks(),
      ]);
      console.log("Columns:", columnsResponse.data);
      console.log("Tasks from API:", tasksResponse.data);
      setColumns(columnsResponse.data);
      setTasks(tasksResponse.data);
      console.log("Tasks after setState:", tasks);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreateColumn = async () => {
    const title = prompt("Enter column title:");
    if (title) {
      try {
        const newColumn = await createColumn(title, columns.length);
        setColumns([...columns, newColumn.data]);
      } catch (error) {
        console.error("Error creating column:", error);
      }
    }
  };

  const handleOpenAddTaskModal = (columnId: string) => {
    setCurrentColumn(columnId);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setCurrentColumn(null);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (title: string, description: string) => {
    if (editingTask) {
      try {
        const response = await updateTask(
          editingTask._id,
          title,
          description,
          editingTask.column as string
        );
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === editingTask._id ? response.data : task
          )
        );
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else if (currentColumn) {
      try {
        const response = await createTask(title, description, currentColumn);
        setTasks((prevTasks) => [...prevTasks, response.data]);
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedTask = tasks.find((task) => task._id === draggableId);
    if (!updatedTask) return;

    try {
      // Update the task in the database
      const response = await updateTask(
        draggableId,
        updatedTask.title,
        updatedTask.description,
        destination.droppableId
      );
      console.log(response);

      // Update the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === draggableId
            ? { ...task, column: destination.droppableId }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      // Optionally, you can revert the UI change here if the API call fails
    }
  };

  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setIsTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredAndSortedTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "recent") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm("Are you sure you want to delete this column?")) {
      try {
        await deleteColumn(columnId);
        setColumns(columns.filter((column) => column._id !== columnId));
        setTasks(tasks.filter((task) => task.column !== columnId));
      } catch (error) {
        console.error("Error deleting column:", error);
      }
    }
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} onSort={handleSort} />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column._id}
              className="bg-white p-4 rounded-lg shadow-md w-80 flex-shrink-0"
            >
              <div className="flex justify-between items-center mb-4 bg-blue-500 text-white p-2 rounded">
                <h2 className="font-bold text-lg">{column.title}</h2>
                <button
                  onClick={() => handleDeleteColumn(column._id)}
                  className="text-white hover:bg-red-600 rounded-full p-1"
                  title="Delete column"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
              </div>
              <Droppable
                droppableId={column._id}
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided: any) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[50px]"
                  >
                    {filteredAndSortedTasks
                      .filter(
                        (task) =>
                          task.column === column._id ||
                          (task.column && task.column._id === column._id)
                      )
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-blue-100 p-3 mb-2 rounded shadow"
                            >
                              <h3 className="font-semibold mb-1 text-black">
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {task.description}
                              </p>
                              <p className="text-xs text-gray-500 mb-2">
                                Created at: {formatDate(task.createdAt)}
                              </p>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleOpenEditTaskModal(task)}
                                  className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleOpenTaskDetails(task)}
                                  className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <button
                onClick={() => handleOpenAddTaskModal(column._id)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                title="Add task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Task
              </button>
            </div>
          ))}
          <div className="w-80 flex-shrink-0 flex items-center justify-center">
            <button
              onClick={handleCreateColumn}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded inline-flex items-center"
              title="Add column"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Column
            </button>
          </div>
        </div>
      </DragDropContext>
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSubmit={handleTaskSubmit}
        initialTitle={editingTask?.title || ""}
        initialDescription={editingTask?.description || ""}
        mode={editingTask ? "edit" : "add"}
      />
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={handleCloseTaskDetails}
        task={selectedTask}
      />
    </>
  );
}
