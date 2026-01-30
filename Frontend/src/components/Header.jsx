import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  useDisclosure,
  DropdownItem,
  Button,
  Form,
} from "@heroui/react";
import { supabase } from "../RouterPage.jsx";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { AppContext } from "../App.jsx";

const Header = () => {
  const navigate = useNavigate();
  const { accessToken, fetchData, currentTrip, isAnnonymous, setIsAnnonymous } =
    useContext(AppContext);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [ppLetters, setPPLetters] = useState("");
  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onClose: onRenameClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleRenameTrip = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/trips/${
        currentTrip.tripHeader.trip_id
      }`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title: text }),
      }
    );

    if (response.ok) {
      setTitle(text);
      setText("");
    }
  };

  const handleDeleteTrip = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/trips/${
        currentTrip.tripHeader.trip_id
      }`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.ok) {
      await fetchData();
    } else {
      console.error("Failed to delete trip");
    }
  };

  async function handleLogout({ navigate }) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Logged out successfully");
    }
    navigate("/login");
  }

  useEffect(() => {
    if (currentTrip.tripHeader) {
      setTitle(currentTrip.tripHeader.title);
    }
  }, [currentTrip]);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      const fullName = session?.user?.user_metadata?.fullName;
      const isAnnonymous = session?.user?.is_anonymous;
      setIsAnnonymous(isAnnonymous);
      if (fullName) {
        const initials = fullName
          .split(" ")
          .map((name) => name.charAt(0).toUpperCase())
          .join("");
        setPPLetters(initials);
      }
      if (isAnnonymous) {
        setPPLetters("G");
      } else {
        setPPLetters(
          session?.user?.user_metadata?.fullName
            ? session.user.user_metadata.fullName
                .split(" ")
                .map((name) => name.charAt(0).toUpperCase())
                .join("")
            : "G"
        );
      }
    };
    fetchSession();
  }, []);

  return (
    <div className="flex flex-grow-0 justify-between h-14 p-[6px] w-auto border-b-1 border-bcolor text-[12px] font-semibold">
      <Dropdown>
        <DropdownTrigger>
          <DropdownTrigger>
            <Button
              variant="light"
              size="sm"
              className="rounded-full p-1.5 px-5 w-auto h-auto text-medium font-semibold shrink-0 flex items-center gap-1"
            >
              <h1>{title}</h1>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownTrigger>
        </DropdownTrigger>
        {!isAnnonymous && (
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem
              key="rename"
              onPress={() => {
                setText(title);
                onRenameOpen();
              }}
            >
              Rename Trip
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onPress={onDeleteOpen}
            >
              Delete Trip
            </DropdownItem>
          </DropdownMenu>
        )}
      </Dropdown>
      <Dropdown>
        <DropdownTrigger>
          <DropdownTrigger>
            <button className="p-1 hover:cursor-pointer button-animation">
              <div className="rounded-full bg-[#2e2e2e] w-9 aspect-square ">
                <span className="text-white text-[14px] font-semibold flex items-center justify-center h-full">
                  {ppLetters}
                </span>
              </div>
            </button>
          </DropdownTrigger>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem
            key="logout"
            onPress={() => {
              handleLogout({ navigate });
            }}
          >
            {!isAnnonymous ? "Logout" : "Exit Guest Account"}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal
        backdrop={"blur"}
        isOpen={isRenameOpen}
        onClose={onRenameClose}
        isKeyboardDismissDisabled={true}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                Rename Trip
              </ModalHeader>

              <ModalBody>
                <Form
                  className="flex flex-col"
                  validationBehavior="aria"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameTrip();
                    onClose();
                  }}
                >
                  <Input
                    placeholder="Enter new trip title"
                    className="w-full"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                    }}
                  />
                </Form>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="light"
                  className="bg-black px-3 h-auto text-[12px] font-semibold text-white hover:!bg-[#2e2e2e] ml-4"
                  onPress={() => {
                    handleRenameTrip();
                    onClose();
                  }}
                >
                  Rename
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
      <Modal
        backdrop={"blur"}
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        isKeyboardDismissDisabled={true}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="text-danger">
                Confirm Delete Trip
              </ModalHeader>

              <ModalBody>
                Are you sure you want to delete this trip? This action cannot be
                undone.
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  color="danger"
                  className="font-semibold hover:text-black"
                  onPress={() => {
                    handleDeleteTrip();
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Header;
