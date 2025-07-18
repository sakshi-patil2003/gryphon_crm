import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import TrainingTable from "../components/Learning/TrainingTables/TrainingTable";
import TrainingDetailModal from "../components/Learning/TrainingTables/TrainingDetailModal";
import FilePreviewModal from "../components/Learning/TrainingTables/FilePreviewModal";
import StudentDataPage from "../components/Learning/StudentDataPage";
import InitiationDashboard from "../components/Learning/InitiationDashboard"; // New component
import { useNavigate } from "react-router-dom";

function LearningDevelopment() {
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [modalTrainingId, setModalTrainingId] = useState(null);
  const [studentPageData, setStudentPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("newContact"); // 'newContact' or 'initiation'
  const navigate = useNavigate();

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "trainingForms"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrainings(data);
    } catch (err) {
      console.error("Error fetching trainings:", err);
      setError("Failed to load training data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "newContact") {
      fetchTrainings();
    }
  }, [activeTab]);

  const handleViewStudentData = (item) => {
    if (!item.studentFileUrl) {
      alert("No student file available.");
      return;
    }
    setStudentPageData({
      fileUrl: item.studentFileUrl,
      trainingId: item.id,
      trainingName: item.trainingName || "Training",
    });
  };

  const handleViewMouFile = (item) => {
    if (!item.mouFileUrl) {
      alert("No MOU file available.");
      return;
    }
    setFileType("mou");
    setFileUrl(item.mouFileUrl);
    setModalTrainingId(item.id);
    setShowFileModal(true);
  };

  const handleRefresh = () => {
    fetchTrainings();
  };

  const handleViewTrainers = () => {
    navigate("trainers");
  };

  if (studentPageData) {
    return (
      <StudentDataPage
        fileUrl={studentPageData.fileUrl}
        trainingId={studentPageData.trainingId}
        trainingName={studentPageData.trainingName}
        onBack={() => setStudentPageData(null)}
      />
    );
  }

  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">
          Training Onboarding Submissions
        </h1>
        <button
          onClick={handleViewTrainers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Trainers
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "newContact"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("newContact")}
        >
          New Contact
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "initiation"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("initiation")}
        >
          Initiation
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
          <button
            onClick={fetchTrainings}
            className="ml-4 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "newContact" ? (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <TrainingTable
                trainingData={trainings}
                onRowClick={setSelectedTraining}
                onViewStudentData={handleViewStudentData}
                onViewMouFile={handleViewMouFile}
              />

              {selectedTraining && (
                <TrainingDetailModal
                  training={selectedTraining}
                  onClose={() => setSelectedTraining(null)}
                />
              )}

              {showFileModal && fileType === "mou" && (
                <FilePreviewModal
                  fileUrl={fileUrl}
                  type={fileType}
                  trainingId={modalTrainingId}
                  onClose={() => setShowFileModal(false)}
                />
              )}
            </>
          )}
        </>
      ) : (
        <InitiationDashboard />
      )}
    </div>
  );
}

export default LearningDevelopment;