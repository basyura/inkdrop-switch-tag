"use babel";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dropdown } from "semantic-ui-react";
import { useModal } from "inkdrop";

const NarrowTagDialog = (_) => {
  const { Dialog } = inkdrop.components.classes;

  const modal = useModal();
  const dropdownRef = useRef(null);
  const [options, setOptions] = useState([]);

  let isClosing_ = false;
  /*
   *
   */
  const open = useCallback(() => {
    // set menu's height
    const height = document.querySelector(".editor").clientHeight;
    document.documentElement.style.setProperty(
      "--narrow-tag-menu-height",
      (height / 2).toString(10) + "px"
    );
    document.documentElement.style.setProperty(
      "--narrow-tag-dialog-margin-top",
      (-1 * height + 200).toString(10) + "px"
    );

    // build options
    const tags = buildTags();
    setOptions(tags);

    modal.show();
  }, []);
  /*
   *
   */
  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      "narrow-tag:open": () => {
        open();
      },
    });
    return () => sub.dispose();
  }, [open]);
  /*
   *
   */
  useEffect(() => {
    // check state
    if (!modal.state.visible) {
      return;
    }

    // how to focus? wait for ui
    setTimeout(() => {
      const ele = document.querySelector(".narrow-tag-dropdown input");
      if (ele != null) {
        ele.focus();
      }
    }, 100);
  });
  /*
   *
   */
  const handleKeyDown = (ev) => {
    const nev = ev.nativeEvent;

    if (nev.key == "Escape") {
      close();
      return;
    }

    if (!nev.ctrlKey) {
      return;
    }
    // delete word (clear)
    if (nev.key == "w") {
      dropdownRef.current.clearSearchQuery();
      return;
    }

    let first = -1;
    // check keyCode
    if (nev.key == "n") {
      first = 40;
    } else if (nev.key == "p") {
      first = 38;
    }
    // fire
    if (first > 0) {
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }));
    }
  };
  /*
   *
   */
  const handleOnChange = (_, data) => {
    if (isClosing_) {
      return;
    }
    isClosing_ = true;

    close();
    setTimeout(() => {
      invoke("core:note-list-show-all-notes");
      setTimeout(() => {
        invoke("core:find-clear", null, null);
        setTimeout(() => {
          invoke("core:filter-by-tag", { tagId: data.value });
          invoke("editor:focus");
        }, 100);
      }, 100);
    }, 100);
  };
  /*
   *
   */
  const buildTags = () => {
    const { tags } = inkdrop.store.getState();
    const options = [];
    tags.all.forEach((tag) => {
      options.push({
        key: tag._id,
        text: tag.name,
        value: tag._id,
      });
    });

    return options;
  };
  /*
   *
   */
  const close = () => {
    modal.close();
    invoke("editor:focus");
  };
  /*
   *
   */
  const invoke = (cmd, param, ele) => {
    if (ele == null) {
      ele = document.body;
    }
    if (param == null) {
      param = {};
    }
    inkdrop.commands.dispatch(ele, cmd, param);
  };
  /*
   *
   */
  return (
    <Dialog
      {...modal.state}
      onBackdropClick={close}
      hiding={false}
      className="narrow-tag-dialog"
    >
      <Dialog.Content>
        <Dropdown
          ref={dropdownRef}
          className="narrow-tag-dropdown"
          options={options}
          placeholder="Select Tag"
          selectOnNavigation={false}
          onChange={handleOnChange}
          searchInput={
            <Dropdown.SearchInput
              className="ui input"
              onKeyDown={handleKeyDown.bind(this)}
            />
          }
          fluid
          selection
          search
        />
      </Dialog.Content>
    </Dialog>
  );
};

export default NarrowTagDialog;
