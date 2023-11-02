"use client";

import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Test Modal"
      description="test description"
      isOpen={true}
      onChange={() => {}}
    >
      <div>Test Child</div>
    </Modal>
  );
};
