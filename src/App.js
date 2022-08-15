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
                <Row>
                    <Col sm={8}>
                        <Navbar className="header-brand">
                            <Navbar.Brand as={Link} to="/">
                                <img
                                    alt=""
                                    src={HeaderImage}
                                    className=""
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
                            <Route path="/" element={<Home content="1" />} />
                            <Route path="/page-1" element={<PageContent page="1" />} />
                            <Route path="/page-2" element={<PageContent page="2" />} />
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

function Home(params) {
    return (
        <>
            <div className="content home">
                {params.content === "1" &&
                    <>
                        <p>Home content</p>
                    </>
                }
            </div>
        </>
    );
}

function PageContent(params) {
    if (params.page === "1") {
        return (
            <Page1Content />
        );
    } else if (params.page === "2") {
        return (
            <Page2Content />
        );
    }
}

function Page1Content() {
    return (
        <>
            <p>Page 1 Content</p>
        </>
    );
}

function Page2Content() {
    return (
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
