import React, { useState, useEffect } from "react";
import { getContract } from "../utils/contract";

const Voting = () => {
  const [candidate, setCandidate] = useState(null);
  const [isElectionEnded, setIsElectionEnded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = await getContract();
        const candidateData = await contract.getCandidate(1);
        setCandidate({
          id: candidateData.id.toString(),
          name: candidateData.name,
          voteCount: candidateData.voteCount.toString(),
        });

        const electionStatus = await contract.electionEnded();
        setIsElectionEnded(electionStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="card">
      <h1>Voting Hey there DApp</h1>
      <p>
        <strong>Election Ended:</strong> {isElectionEnded ? "Yes" : "No"}
      </p>
      {candidate ? (
        <div>
          <h2>Candidate Details</h2>
          <p><strong>ID:</strong> {candidate.id}</p>
          <p><strong>Name:</strong> {candidate.name}</p>
          <p><strong>Votes:</strong> {candidate.voteCount}</p>
        </div>
      ) : (
        <p>Loading candidate data...</p>
      )}
    </div>
  );
};

export default Voting;
