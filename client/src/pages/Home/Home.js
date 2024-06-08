import { useState } from "react";
import { Container, Button, Row } from "react-bootstrap";

import { useThemeContext } from "../../context/theme.context";
import Register from "./Register";
import Login from "./Login";
import Feedback from "./Feedback";

import zombie from "./zombie.gif";

import "./home.css";

function Home() {
  const { viewSize } = useThemeContext();
  const [submitFeedback, setFeedbackMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <Container className="main-container">
      <img src={zombie} alt="PNS Logo" />
      {isRegisterMode && !submitFeedback && (
        <Register setIsRegisterMode={setIsRegisterMode} />
      )}
      {!isRegisterMode && !submitFeedback && <Login />}

      {submitFeedback && <Feedback setFeedbackMode={setFeedbackMode} />}

      {!isRegisterMode && !submitFeedback && (
        <Container className="register-section">
          <Row className="mb-5 justify-content-center">
            <h4>Not a user? Register today!</h4>
            <Button
              size={viewSize}
              onClick={() => setIsRegisterMode(true)}
              className="register-button"
            >
              Register
            </Button>
          </Row>
          <Row className="mb-1 justify-content-center">
            <h4>Tell me how I can improve things.</h4>
            <Button
              size={viewSize}
              onClick={() => setFeedbackMode(true)}
              className="submit-button"
            >
              Feedback
            </Button>
          </Row>
        </Container>
      )}
    </Container>
  );
}

export default Home;
