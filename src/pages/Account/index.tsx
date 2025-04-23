import { useState } from "react";
import { supabase } from "../../app/supabaseClient";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { userCreated } from "features/auth/user/user-slice";
import { Button, FloatingLabel, Form, FormControl } from "react-bootstrap";
import {
  updateProfileInformation,
} from "actions/user-api";
import { useForm } from "react-hook-form";
import { PageNotFound } from "pages/NotFound/PageNotFound";

const Account = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm();
  const session = useAppSelector((state) => state.session.session);

  const [website, ] = useState("");
  const [avatar_url,] = useState("");

  const name = useAppSelector((state) => state.user.name);
  const userKind = useAppSelector((state) => state.user.userKind);

  const options = [
    { value: "practitioner", label: "Practitioner" },
    { value: "patient", label: "Patient" },
  ];

  const updateProfile = async (formData: any) => {
    if (session) {
      const { user } = session;

      const updates = {
        id: user.id,
        username: formData.username,
        website,
        avatar_url,
        updated_at: new Date(),
        user_kind: formData.user_kind,
      };

      const { error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) {
        alert(error.message);
      }
      dispatch(updateProfileInformation(session, updates));
    }
  };

  return (
    <>
      {session !== null ? (
        <div style={{ padding: "200px" }}>
          <Form
            onSubmit={handleSubmit((data) => {
              updateProfile(data);
            })}
            className="form-widget"
          >
            <div className="mb-3">User ID : {session.user.id} </div>

            <FloatingLabel
              label="Email"
              controlId="floatingInput"
              className="mb-3"
            >
              <FormControl
                id="email"
                type="email"
                defaultValue={session.user.email}
                {...register("email", { required: true })}
              />
            </FloatingLabel>

            <FloatingLabel
              label="Name"
              controlId="floatingInput"
              className="mb-3"
            >
              <FormControl
                id="username"
                type="text"
                defaultValue={name}
                {...register("username", { required: true })}
              />
            </FloatingLabel>

            <div>
              <FloatingLabel
                label="Role"
                controlId="floatingSelect"
                className="mb-3"
              >
                <Form.Select id="role" {...register("user_kind")} disabled={true}>
                  {options.map((option) =>
                    option.value === userKind ? (
                      <option value={option.value} selected>
                        {option.label}
                      </option>
                    ) : (
                      <option value={option.value}>{option.label}</option>
                    )
                  )}
                </Form.Select>
              </FloatingLabel>
            </div>
            <div>
              <Button variant="primary" type="submit" className="mb-3">
                Update profile
              </Button>
              <br/>
              <Button
                variant="danger"
                onClick={() => {
                  supabase.auth.signOut();
                  dispatch(userCreated({ name: "", id: "", userKind: "guest" }));
                }}
              >
                Sign Out
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <PageNotFound></PageNotFound>
      )}
    </>
  );
};

export default Account;
