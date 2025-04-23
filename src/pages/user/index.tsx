import { useAppSelector } from "app/hooks";
import { Button, Card, ListGroup } from "react-bootstrap";

export function UserPage() {
    return (
        <div style={{ padding: "200px" }}>
            <Card>
                <Card.Header>
                    <h3>Profile</h3>
                </Card.Header>
                <Card.Body>
                    <Card.Title>Information</Card.Title>
                    <Card.Text>
                        <ListGroup>
                            <ListGroup.Item><strong>ID:</strong> {useAppSelector((state) => state.user.id)}</ListGroup.Item>
                            <ListGroup.Item><strong>Username:</strong> {useAppSelector((state) => state.user.name)}</ListGroup.Item>
                            <ListGroup.Item><strong>Role:</strong> {useAppSelector((state) => state.user.userKind)}</ListGroup.Item>
                        </ListGroup>
                    </Card.Text>
                    <Button variant="primary">Edit</Button>
                </Card.Body>
            </Card>
        </div>
    );
}