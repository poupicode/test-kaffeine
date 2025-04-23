import { NavDropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { DropdownItemProps } from "react-bootstrap/esm/DropdownItem";
import { randomUUID } from "crypto";


// Props interface
interface MenuElement extends DropdownItemProps {
  separator?: boolean;
  onClick?: () => void;

}

interface Props {
  menuContent: MenuElement[]
};

export function MenuDropDown(props: Props) {
  return (
    <>
      <NavDropdown
        title={
          <>
            <FaUserCircle size={30} />
          </>
        }
        id="collasible-nav-dropdown"
      >
        { props.menuContent.map((item) => {
            return (
              <>
                { item.separator ? <hr className="dropdown-divider" /> : null }
                <NavDropdown.Item href={ item.href } {...item} key={ item.title } >
                  { item.title }
                </NavDropdown.Item>
              </>
            )
          })
        }
    </NavDropdown>
    </>
  );
}
