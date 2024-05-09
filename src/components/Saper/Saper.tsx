import "./styles.css";
import classNames from "classnames";

import { useSaperContext } from "../../App";
import type { Field } from "../../types";
import { getFieldID, getIsFieldClickable } from "../../utils";

export const Saper = () => {
  const {
    count,
    hydratedFields,
    isWon,
    setHydratedFields,
    bombsLeft,
    setBombsLeft,
  } = useSaperContext();

  const onButtonClick = (id: number) => {
    const editIndex = id - 1;
    const clickedField = hydratedFields[editIndex];
    if (clickedField.bomb) {
      const finalView: Field[] = hydratedFields.map((field) => ({
        ...field,
        state: field.id === id ? "exploded" : "clicked",
      }));
      setHydratedFields(finalView);
      return;
    }

    setHydratedFields((prevFields) => [
      ...prevFields.slice(0, editIndex),
      { ...prevFields[editIndex], state: "clicked" },
      ...prevFields.slice(editIndex + 1),
    ]);
  };

  const onRightButtonClick = (id: number) => {
    const editIndex = id - 1;

    if (bombsLeft === 0 && hydratedFields[editIndex].state !== "flagged")
      return;

    setHydratedFields((prevFields) => [
      ...prevFields.slice(0, editIndex),
      {
        ...prevFields[editIndex],
        state:
          hydratedFields[editIndex].state === "flagged" ? "virgin" : "flagged",
      },
      ...prevFields.slice(editIndex + 1),
    ]);

    setBombsLeft((prevState) =>
      hydratedFields[editIndex].state === "flagged"
        ? prevState + 1
        : prevState - 1,
    );
  };

  const handleClick = (id: number) => {
    const field = hydratedFields.find((field) => field.id === id);

    if (
      id > hydratedFields.length ||
      id < 1 ||
      !field ||
      (field &&
        (field.bomb || field?.state !== "virgin" || field.bombsInTouch !== 0))
    ) {
      return;
    }

    const nextIdField = getFieldID(field.x, field.y + 1, hydratedFields);

    if (nextIdField && getIsFieldClickable(nextIdField)) {
      onButtonClick(nextIdField.id);
      handleClick(nextIdField.id);
    }

    const prevIdField = getFieldID(field.x, field.y - 1, hydratedFields);

    if (prevIdField && getIsFieldClickable(prevIdField)) {
      onButtonClick(prevIdField.id);
    }

    const aboveIdField = getFieldID(field.x - 1, field.y, hydratedFields);

    if (aboveIdField && getIsFieldClickable(aboveIdField)) {
      onButtonClick(aboveIdField.id);
      handleClick(aboveIdField.id);
    }

    const underIdField = getFieldID(field.x + 1, field.y, hydratedFields);

    if (underIdField && getIsFieldClickable(underIdField)) {
      onButtonClick(underIdField.id);
    }
  };

  return (
    <div className={classNames('box', {"box-modified": count === 20})}>
      {hydratedFields.map(({ state, id, x, y, bomb, bombsInTouch }) =>
        !isWon && (state === "virgin" || state === "flagged") ? (
          <button
            key={`field-${id}`}
            aria-label={`button with index x:${x}, y:${y} ${state === "flagged" ? "flagged" : "not flagged"}.`}
            onClick={() => {
              if (hydratedFields[id - 1].state === "flagged") return;
              onButtonClick(id);
              if (isWon) {
                setHydratedFields;
                return;
              }
              handleClick(id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onRightButtonClick(id);
            }}
          >
            {state === "flagged" ? "🚩" : ""}
          </button>
        ) : (
          <div
            key={`field-${id}`}
            className={classNames("box-field", {
              "box-field-exploded": state === "exploded",
              "box-field-saved": bomb && isWon,
            })}
          >
            {bomb ? "💣" : bombsInTouch === 0 ? "" : bombsInTouch}
          </div>
        ),
      )}
    </div>
  );
};