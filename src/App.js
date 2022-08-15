import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import HeaderImage from './images/header_image.png';

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from "react-router-dom";

const SiteName = "Amplify React Site";

function App() {
  return (
    <div className="App">
        <Router>
            <Container>
                <Row className="header-row">
                    <Col sm={8} className="header-col">
                        <Navbar className="header-brand">
                            <Navbar.Brand as={Link} to="/">
                                <img
                                    alt=""
                                    src={HeaderImage}
                                    className="img-fluid"
                                />{'  '}
                            </Navbar.Brand>
                        </Navbar>
                        <Container className="header-sub">
                            <Row>
                                <Col>
                                    Welcome to the {SiteName} website!
                                    <br />
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col sm={4} className="sidebar">
                        <Navbar>
                            <Nav>
                                <Nav.Link as={Link} to="/">Home</Nav.Link>
                                <Nav.Link as={Link} to="/page-1">Page 1</Nav.Link>
                                <Nav.Link as={Link} to="/page-2">Page 2</Nav.Link>
                            </Nav>
                        </Navbar>
                    </Col>
                </Row>
                <Row>
                    <Col sm>
                        <Routes>
                            <Route path="/"       element={<HomeContent />} />
                            <Route path="/page-1" element={<Page1Content />} />
                            <Route path="/page-2" element={<Page2Content />} />
                        </Routes>
                    </Col>
                </Row>
                <Row>
                    <Col sm>
                        <Footer />
                    </Col>
                </Row>
            </Container>
        </Router>
    </div>
  );
}

function Content(pageOutput) {
    return (
        <>
            <div className="content">
                {pageOutput}
            </div>
        </>
    );
}

function HomeContent() {
    return Content(
        <>
            <p>Home Content</p>
        </>
    );
}

function Page1Content() {
    return Content(
        <>
            <p>Page 1 Content</p>
        </>
    );
}

function Page2Content() {
    return Content(
        <>
            <p>Page 2 Content</p>
        </>
    );
}

function Footer() {
    return (
        <div className="footer">
            <br />
            <Nav.Link as={Link} to="/">The {SiteName} website</Nav.Link>
            <br />
            Established {new Date().getFullYear()}
        </div>
    );
}

export default App;
