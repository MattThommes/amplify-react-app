import logo from './logo.svg';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from "react-router-dom";

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
                                    src={logo}
                                    className=""
                                />{'  '}
                            </Navbar.Brand>
                        </Navbar>
                        <Container className="header-sub">
                            <Row>
                                <Col>
                                    Welcome to the Amplify React website!
                                    <br />
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col sm={4} className="sidebar">
                        <Navbar>
                            <Nav>
                                <Nav.Link as={Link} to="/">Home</Nav.Link>
                                <Nav.Link as={Link} to="/section-1">Section 1</Nav.Link>
                                <Nav.Link as={Link} to="/section-2">Section 2</Nav.Link>
                            </Nav>
                        </Navbar>
                    </Col>
                </Row>
                <Row>
                    <Col sm>
                        <Routes>
                            <Route path="/" element={<Home content="1" />} />
                            <Route path="/section-1" element={<SectionContent section="1" content="1" />} />
                            <Route path="/section-2" element={<SectionContent section="2" content="1" />} />
                        </Routes>
                    </Col>
                    <Col sm>
                        <Routes>
                            <Route path="/" element={<Home content="2" />} />
                            <Route path="/section-1" element={<SectionContent section="1" content="2" />} />
                            <Route path="/section-2" element={<SectionContent section="2" content="2" />} />
                        </Routes>
                    </Col>
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
                        <p>Home 1 content</p>
                    </>
                }
                {params.content === "2" &&
                    <>
                        <p>Home 2 content</p>
                    </>
                }
            </div>
        </>
    );
}

function SectionContent(params) {
    return (
        <>
            {params.section === "1" ? (
                <>
                    <div className="content test">
                        {params.content === "1" &&
                            <>
                                <p>Section 1 Content 1</p>
                            </>
                        }
                        {params.content === "2" &&
                            <>
                                <p>Section 1 Content 2</p>
                            </>
                        }
                    </div>
                </>
            ) : (
                <>
                    <div className="content test">
                        {params.content === "1" &&
                            <>
                                <p>Section 2 Content 1</p>
                            </>
                        }
                        {params.content === "2" &&
                            <>
                                <p>Section 2 Content 2</p>
                            </>
                        }
                    </div>
                </>
            )}
        </>
    );
}

function Footer() {
    return (
        <div className="footer">
            <br />
            <Nav.Link as={Link} to="/">The Amplify React website</Nav.Link>
            <br />
            Established {new Date().getFullYear()}
        </div>
    );
}

export default App;
