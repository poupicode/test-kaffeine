import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { IceInformation } from './ICEInfomation';
import { GiIceCube } from 'react-icons/gi';

export function IceInformationButton() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="me-2">
        <GiIceCube size={"20px"} /> 
      </Button>
      <Offcanvas show={show} onHide={handleClose} key='0' placement='end' name='ICE Information'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Ice Information</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <IceInformation></IceInformation>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
