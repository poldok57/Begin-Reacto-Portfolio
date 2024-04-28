import React, { useRef, useMemo, useState } from "react";
import { withMousePosition } from "../../context/withMousePosition";
import { MdTimeline } from "react-icons/md";
// import { MdRadioButtonUnchecked } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";

import { Button } from "../atom/Button";
import { DRAWING_MODES } from "./Draw";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";
import { useHistory } from "./DrawHistory";
import { useMessage } from "../../context/MessageProvider";
import { ConfirmationModal } from "../atom/ConfirmationModal";

// import clsx from "clsx";

export const DrawControl = ({
  setParams,
  changeMode,
  defaultMode,
  drawingParams,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [withText, setWithText] = useState(false);

  const { alertMessage } = useMessage();
  const resetButtonRef = useRef(null);
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const saveButtonRef = useRef(null);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const filenameRef = useRef(null);

  const { eraseHistory } = useHistory();

  const handleConfirmErase = () => {
    alertMessage("action confirmed");
    changeMode(DRAWING_MODES.ERASE);
    setMode(DRAWING_MODES.DRAW);
    setResetModalOpen(false);
    eraseHistory();
  };

  // const handleClose = () => {
  //   setModalOpen(false);
  // };

  const addEventChangeMode = (mode) => {
    const event = new CustomEvent("modeChanged", { detail: { mode } });
    document.dispatchEvent(event);
  };
  const handleParamChange = (newParams) => {
    setParams(newParams);
    addEventChangeMode(DRAWING_MODES.DRAWING_CHANGE);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    changeMode(newMode);
    addEventChangeMode(newMode);
  };

  const handleUndo = (event) => {
    event.preventDefault();
    addEventChangeMode(DRAWING_MODES.UNDO);
  };

  return useMemo(() => {
    return (
      <div className="flex w-auto flex-col gap-1 rounded-md border-2 border-secondary bg-background p-1 shadow-xl">
        <div className="flex flex-row gap-4">
          <Button
            selected={mode == DRAWING_MODES.DRAW}
            onClick={() => handleModeChange(DRAWING_MODES.DRAW)}
          >
            Draw
          </Button>
          <Button
            selected={mode == DRAWING_MODES.LINE}
            onClick={() => handleModeChange(DRAWING_MODES.LINE)}
          >
            <MdTimeline />
          </Button>
          <Button
            selected={mode == DRAWING_MODES.TEXT}
            onClick={() => handleModeChange(DRAWING_MODES.TEXT)}
          >
            Text
          </Button>
        </div>
        <DrawControlLine
          mode={mode}
          handleParamChange={handleParamChange}
          drawingParams={drawingParams}
        />
        <DrawControlShape
          mode={mode}
          drawingParams={drawingParams}
          handleParamChange={handleParamChange}
          handleModeChange={handleModeChange}
          setWithText={setWithText}
        />
        <DrawControlText
          mode={mode}
          hidden={mode != DRAWING_MODES.TEXT && withText === false}
          drawingParams={drawingParams}
          handleTextParams={handleParamChange}
        />

        <div className="relative m-auto flex gap-4">
          <Button onClick={(e) => handleUndo(e)}>
            <SlActionUndo />
          </Button>
          <Button
            ref={resetButtonRef}
            onClick={() => {
              setResetModalOpen(true);
            }}
          >
            Reset
          </Button>
          <ConfirmationModal
            referrer={resetButtonRef}
            isOpen={isResetModalOpen}
            onClose={() => setResetModalOpen(false)}
            onConfirm={handleConfirmErase}
          >
            Do you want to erase all your drawing ?
          </ConfirmationModal>
          <Button
            ref={saveButtonRef}
            onClick={() => {
              setSaveModalOpen(true);
            }}
          >
            Save my drawing
          </Button>
          <ConfirmationModal
            referrer={saveButtonRef}
            isOpen={isSaveModalOpen}
            onClose={() => setSaveModalOpen(false)}
            onConfirm={() => {
              changeMode(DRAWING_MODES.SAVE, filenameRef.current.value);
              setSaveModalOpen(false);
            }}
          >
            <div className="flex flex-row">
              Do you want to reccord this image ?
            </div>
            <div className="flex flex-row">
              Name:
              <input
                className="mx-2 h-8 w-40 rounded-md border-2 border-gray-500 bg-white px-2"
                type="text"
                defaultValue="my image"
                ref={filenameRef}
              />
            </div>
          </ConfirmationModal>
        </div>
      </div>
    );
  }, [mode, withText, drawingParams, isResetModalOpen, isSaveModalOpen]);
};

export const DrawControlWP = withMousePosition(DrawControl);
