import {
  Card,
  Button,
  Spinner,
  Form,
  FloatingLabel,
  FormControl,
} from "react-bootstrap";
import { supabase } from "../../../app/supabaseClient";
import { useState } from "react";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { passwordRecoveryUpdated } from "features/auth/session/session-slice";


export function PasswordRecovery() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const UpdatePassword = async (userData: any) => {
    try {
      setLoading(true);
      if (userData.password !== userData.confirmPassword) {
        alert("Password does not match");
        return;
      }
      const { data, error } = await supabase.auth.updateUser({
        password: userData.password,
      });
      if (data) {
        alert("Password updated successfully");
        dispatch(passwordRecoveryUpdated(false));
      }
      if (error) {
        alert(error);
        return;
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h3>
            <strong>New Password</strong>
          </h3>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <Button variant="primary" disabled>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Loading, please wait...
            </Button>
          ) : (
            <Form
              onSubmit={handleSubmit((data) => {
                UpdatePassword(data);
              })}
            >
              <FloatingLabel label="Password" className="mb-3">
                <FormControl
                  id="password"
                  className="inputField"
                  type="password"
                  placeholder="Your password"
                  {...register("password", { required: true })}
                />
              </FloatingLabel>

              <FloatingLabel label="Confirm Password" className="mb-3">
                <FormControl
                  id="confirmPassword"
                  className="inputField"
                  type="password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword", { required: true })}
                />
              </FloatingLabel>

              <Button type="submit" className="primary" aria-live="polite">
                Save
              </Button>
              <hr></hr>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
