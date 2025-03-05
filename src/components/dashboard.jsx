import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { message, Input } from "antd"
import { CircularProgress, LinearProgress } from "@mui/material"; // For spinner and progress bar
import { FaPlus, FaSignOutAlt, FaTrash, FaTruckLoading } from "react-icons/fa";
import { getUserRole } from "../utils/helper";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [content, setContent] = useState("");
  const [userRole, setUserRole] = useState("");
  const [socket, setSocket] = useState(null);
  const [title, setTitle] = useState("");
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingProgress, setLoadingProgress] = useState(false); // Loading state
  const [saveLoading, setSaveLoading] = useState(false); // Loading state
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress state
  const [isRealTime, setIsRealTime] = useState(0); // Delete progress state
  const [selectedLetterId, setSelectedLetterId] = useState(null); // Track selected letter
  const navigate = useNavigate();

  // Fetch saved letters on component mount
  useEffect(() => {
    const fetchRole = async () => {
      const role = await getUserRole(); // Wait for the role
      setUserRole(role); // Set the actual role, not a Promise
    };

    fetchRole(); // Call the async function
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`); // Replace with your backend URL
    setSocket(newSocket);
    fetchSavedLetters();

    return () => newSocket.disconnect(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for updates from other users
      socket.on("update", (data) => {
        const found = letters.filter((letter) => {
          if (letter.id === data.fileId) {
            return true;
          }
        })
        if (found.length == 0) {
          setIsRealTime(true);
          setUserRole("user");
        }
        setSelectedLetterId(data.fileId);
        setContent(data.content);
      });
    }
  }, [socket, selectedLetterId]);

  const fetchSavedLetters = async () => {
    setLoading(true); // Start loading
    setUploadProgress(0); // Reset progress
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/storage/list-letters`, {
        withCredentials: true,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted); // Update progress
        },
      });
      message.success("Letters Loaded successfully");
      setLetters(res.data.files);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false); // Stop loading
      setUploadProgress(0); // Reset progress
    }
  };

  // Save letter to Google Drive
  const saveorUpdateLetter = async () => {
    setSaveLoading(true)
    setUploadProgress(0); // Reset progress
    try {
      if (selectedLetterId) {
        // Update existing letter
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/storage/update-letter/${selectedLetterId}`,
          { title, content },
          { withCredentials: true }
        );
        message.success("Letter updated successfully");
      } else {
        // Save new letter
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/storage/save-letter`,
          { title, content },
          {
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded) * 100 / progressEvent.total
              );
              setUploadProgress(percentCompleted); // Update progress
            },
          }
        );
        message.success("Letter saved Successfully");
      }
      fetchSavedLetters(); // Refresh the list of letters
    } catch (error) {
      message.error(`Error saving letter. ${error.message}`);
    } finally {
      setSaveLoading(false)
      setUploadProgress(0); // Reset progress
    }
  };

  // Load a specific letter from Google Drive
  const loadLetter = async (fileId) => {
    setLoadingProgress(true)
    setLoading(true); // Start loading
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/storage/get-letter/${fileId}`, {
        withCredentials: true,
      });
      message.success("Letter Loaded Successfully");
      setContent(res.data.content); // Set the letter content in the editor
      setTitle(res.data.title); // Set the letter title
    } catch (error) {
      message.error(`Error Loading letter. ${error.message}`);
    } finally {
      setSelectedLetterId(fileId); // Set the letter
      setLoadingProgress(false)
      setLoading(false); // Stop loading
    }
  };

  // Delete a letter
  const deleteLetter = async (fileId) => {
    setLoadingProgress(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/storage/delete-letter/${fileId}`, {
        withCredentials: true,
      });
      message.success("Letter deleted successfully");
      fetchSavedLetters(); // Refresh the list of letters
      if (fileId === selectedLetterId) {
        setContent(""); // Clear the editor
        setTitle(""); // Clear the title
        setSelectedLetterId(null); // Reset selected letter
      }
    } catch (error) {
      message.error(`Error deleting letter: ${error.message}`);
    } finally {
      setLoadingProgress(false);
    }
  };
  // Delete a letter
  const logOut = async () => {
    setLoadingProgress(true);
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        withCredentials: true,
      });
      navigate("/"); // Redirect to login page
      message.success("Logout successfully");
    } catch (error) {
      message.error(`Error logging out: ${error.message}`);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Save draft locally on change
  const handleChange = (value) => {
    setContent(value);
    if (socket) {
      // Send updates to other users
      socket.emit("edit", { fileId: selectedLetterId, content: value });
    }
  };


  return (
    <>

      <h1 style={{ textAlign: "center" }}>Welcome {userRole || "User"}</h1>
      {uploadProgress > 0 && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          style={{ position: "fixed", top: "0", left: "0", width: "100%", bottom: "100%" }}
        />
      )}
      <div className="dashboardContainer">
        <div className="letterListContainer">
          <h2>Saved Letters</h2>
          <span className="addNew" style={{ justifyContent: "center" }} onClick={() => {
            setContent(""); // Clear the editor
            setTitle(""); // Clear the title
            setSelectedLetterId(null); // Reset selected letter
          }}><FaPlus /></span>
          <ul className="letterList">
            {letters.map((letter) => (
              <li key={letter.id} className={`${selectedLetterId == letter.id ? "active" : ""}`} onClick={() => loadLetter(letter.id)}>
                <div>{letter.name.replace(/\.docx$/, "") || "[undefined]"}</div>
                {userRole === "admin" &&
                  <div className="trash"><FaTrash onClick={(e) => { deleteLetter(letter.id) }} /></div>
                }
              </li>
            ))}
          </ul>

        </div>
        <div className="editorContainer">
          {selectedLetterId ? <h2>{isRealTime ? "Real Time " : ""}Update Selected Letter</h2> : <h2>Letter</h2>}
          {loading ? (
            <CircularProgress /> // Show spinner while loading
          ) : (<>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading} // Disable input while loading
              style={{ margin: "20px" }}
            />
            <ReactQuill
              value={content}
              onChange={handleChange}
              className="editor"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              style={{ borderRadius: "15px", }}
              readOnly={loading} // Disable editor while loading
            />

            <div className="editorButton">
              {userRole === "admin" &&
                (selectedLetterId ?
                  <button onClick={saveorUpdateLetter} disabled={saveLoading || loadingProgress}>
                    {saveLoading ? "Updating..." : "Update to Google Drive"}
                  </button>
                  :
                  <button onClick={saveorUpdateLetter} disabled={saveLoading || loadingProgress}>
                    {saveLoading ? "Saving..." : "Save to Google Drive"}
                  </button>
                )
              }

              <button onClick={fetchSavedLetters} disabled={loadingProgress || saveLoading}>
                {loadingProgress ? "Loading..." : "Load Letters"}
              </button>
              <button onClick={logOut} disabled={loadingProgress || saveLoading}>
                {loadingProgress ? <FaTruckLoading /> : <FaSignOutAlt />}
              </button>
            </div>
          </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;