import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { CreateQuiz } from "./pages/CreateQuiz";
import { EditQuiz } from "./pages/EditQuiz";
import { TakeQuiz } from "./pages/TakeQuiz";
import { QuizResults } from "./pages/QuizResults";
import { StudentResults } from "./pages/StudentResults";
import { BackendStatus } from "./pages/BackendStatus";
import { TestQuizLink } from "./pages/TestQuizLink";
import { OwnerLayout } from "./components/OwnerLayout";

export const router = createBrowserRouter([
  { path: "quiz/:id", Component: TakeQuiz },
  { path: "quiz/:quizId/results/:attemptId", Component: QuizResults },
  {
    path: "/",
    Component: OwnerLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "create", Component: CreateQuiz },
      { path: "edit/:id", Component: EditQuiz },
      { path: "results/:id", Component: QuizResults },
      { path: "student-results", Component: StudentResults },
      { path: "backend-status", Component: BackendStatus },
      { path: "test-quiz-link", Component: TestQuizLink },
    ],
  },
]);
