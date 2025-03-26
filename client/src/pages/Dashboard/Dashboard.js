import { useState, useEffect, useCallback } from "react";
import { Button, Row, Col, InputGroup, Form, Accordion } from "react-bootstrap";

import { api } from "../../axios_config.js";
import NavMenu from "../../components/NavMenu";
import { useAccountContext } from "../../context/account.context";
import { useLoginContext } from "../../context/login.context";
import { useThemeContext } from "../../context/theme.context";

import "./dashboard.css";

function Dashboard() {
  let timer;
  const { viewSize } = useThemeContext();
  const { user } = useLoginContext();
  const { accounts, setCurrentAccount, setAllAccounts } = useAccountContext();
  const [accName, setAccName] = useState("");
  const [buildGearOptions] = useState([
    "Builder Hammer",
    "Builder Shield",
    "Builder Jacket",
    "Builder Helmet",
    "Builder Ring",
    "Builder Boots",
  ]);
  const [gearLevelsBuild, setGearLevelsBuild] = useState([]);
  const [isCheckedBuild, setChecksBuild] = useState(null);
  const [resGearOptions] = useState([
    "Researcher Pincers",
    "Researcher Shield",
    "Researcher Coat",
    "Researcher Mask",
    "Researcher Ring",
    "Researcher Boots",
  ]);
  const [gearLevelsRes, setGearLevelsRes] = useState([]);
  const [isCheckedRes, setChecksRes] = useState(null);
  const [heroOptions] = useState(["Chester", "Anahita", "Kento", "Xavis"]);
  const [heroLevels, setHeroLevels] = useState([]);
  const [isCheckedHeros, setChecksHeros] = useState(null);
  const [speedBoosts, setSpeedBoosts] = useState([]);
  const [isInitialized, setInitialized] = useState(false);

  const getUserData = useCallback(async () => {
    try {
      const response = await api.post("/accounts/getAccounts", { user });
      if (response.status === 200) {
        const accs = response.data.data.accs;
        if (accs.length > 0) {
          setAllAccounts(accs);
          setCurrentAccount(accs[0]);
          let newBuildGearList = Array.from({ length: accs.length }, () =>
            Array(buildGearOptions.length).fill(0)
          );
          let newBuildCheckedList = Array.from({ length: accs.length }, () =>
            Array(buildGearOptions.length).fill(false)
          );
          let newResGearList = Array.from({ length: accs.length }, () =>
            Array(resGearOptions.length).fill(0)
          );
          let newResCheckedList = Array.from({ length: accs.length }, () =>
            Array(resGearOptions.length).fill(false)
          );
          let newHeroList = Array.from({ length: accs.length }, () =>
            Array.from({ length: heroOptions.length }, () =>
              new Array(2).fill(0)
            )
          );
          let newHeroCheckedList = Array.from({ length: accs.length }, () =>
            Array(heroOptions.length).fill(false)
          );
          let newBoosts = Array.from({ length: accs.length }, () =>
            Array(2).fill(0)
          );

          for (let i = 0; i < accs.length; i++) {
            let speeds = accs[i].boosts.speeds;
            if (speeds && speeds.length > 0) {
              newBoosts[i][0] = accs[i].boosts.speeds.find(
                (boost) => boost.name === "Build Speed"
              ).value;
              newBoosts[i][1] = accs[i].boosts.speeds.find(
                (boost) => boost.name === "Research Speed"
              ).value;
            }

            for (let j = 0; j < accs[i].boosts.buildergear.length; j++) {
              let piece = accs[i].boosts.buildergear[j];
              let index = buildGearOptions.indexOf(piece.name);
              if (index !== null) {
                newBuildGearList[i][index] = piece.level;
                newBuildCheckedList[i][index] = true;
              }
            }
            for (let j = 0; j < accs[i].boosts.researchgear.length; j++) {
              let piece = accs[i].boosts.researchgear[j];
              let index = resGearOptions.indexOf(piece.name);
              if (index !== null) {
                newResGearList[i][index] = piece.level;
                newResCheckedList[i][index] = true;
              }
            }
            for (let j = 0; j < accs[i].boosts.heroes.length; j++) {
              let hero = accs[i].boosts.heroes[j];
              let index = heroOptions.indexOf(hero.name);
              if (index !== null) {
                newHeroList[i][index][0] = hero.plus;
                newHeroList[i][index][1] = hero.level;
                newHeroCheckedList[i][index] = true;
              }
            }
          }
          setGearLevelsBuild(newBuildGearList);
          setChecksBuild(newBuildCheckedList);
          setGearLevelsRes(newResGearList);
          setChecksRes(newResCheckedList);
          setHeroLevels(newHeroList);
          setChecksHeros(newHeroCheckedList);
          setSpeedBoosts(newBoosts);
          setInitialized(true);
        }
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  },[buildGearOptions, heroOptions, resGearOptions, setAllAccounts, setCurrentAccount, user]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  const handleDelete = async (accName) => {
    try {
      const response = await api.post("/accounts/removeAccount", { user, accName });
      if (response.status === 200) {
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting account data:", error.message);
      return;
    }

    const newList = accounts.filter((acc) => acc.name !== accName);
    setAllAccounts(newList);
  };

  const addAccount = async () => {
    if (accName) {
      try {
        const response = await api.post("/accounts/addAccount", { user, accName });
        if (response == null) {
          console.log("Failed to add account to ", user);
        } else {
          setAccName("");
          getUserData();
        }
      } catch (error) {
        console.error(
          "Account creation failed:",
          error.response ? error.response.data : "No response"
        );
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addAccount();
    }
  };

  const handleGearChange = async (gearLevel, gearindex, acToUpdate, type) => {
    let gearPiece;
    if (type === "build") {
      gearPiece = buildGearOptions[gearindex];
    } else {
      gearPiece = resGearOptions[gearindex];
    }

    let newGear = JSON.stringify({
      name: gearPiece,
      level: gearLevel,
      index: gearindex,
    });

    try {
      const response = await api.post("/gear/updateGearLevel", {
        user,
        acToUpdate,
        newGear,
        type,
      });
      if (response == null) {
        console.log("Failed to set new gear level for ", accName);
      } else {
        getUserData();
      }
    } catch (error) {
      console.error("Failed to set new gear level for ", accName);
    }
  };

  const deleteGear = async (accindex, gearindex, type) => {
    let gearPiece;
    if (type === "build") {
      gearPiece = buildGearOptions[gearindex];
    } else {
      gearPiece = resGearOptions[gearindex];
    }

    let acToUpdate = accounts[accindex].name;

    try {
      const response = await api.post("/gear/deleteGear", {
        user,
        acToUpdate,
        gearPiece,
        type,
      });
      if (response == null) {
        console.log("Failed to set new gear level for ", accName);
      } else {
        getUserData();
      }
    } catch (error) {
      console.error("Failed to set new gear level for ", accName);
    }
  };

  const handleHeroChange = async (accindex, heroindex, newPlus, newLevel) => {
    let hero = heroOptions[heroindex];
    let acToUpdate = accounts[accindex].name;
    let newHero = JSON.stringify({
      name: hero,
      plus: newPlus,
      level: newLevel,
    });

    try {
      const response = await api.post("/hero/updateHeroLevel", {
        user,
        acToUpdate,
        newHero,
      });
      if (response == null) {
        console.log("Failed to set new gear level for ", accName);
      } else {
        getUserData();
      }
    } catch (error) {
      console.error("Failed to set new gear level for ", accName);
    }
  };

  const deleteHero = async (accindex, index) => {
    let hero = heroOptions[index];
    let acToUpdate = accounts[accindex].name;

    try {
      const response = await api.post("/hero/deleteHero", {
        user,
        acToUpdate,
        hero,
      });
      if (response == null) {
        console.log("Failed to set new gear level for ", accName);
      } else {
        getUserData();
      }
    } catch (error) {
      console.error("Failed to set new gear level for ", accName);
    }
  };

  const handleCheck = (accindex, index, type) => {
    let newCheckedList;
    if (type === "build") {
      newCheckedList = [...isCheckedBuild];
      newCheckedList[accindex][index] = !newCheckedList[accindex][index];
      setChecksBuild(newCheckedList);
    } else if (type === "research") {
      newCheckedList = [...isCheckedRes];
      newCheckedList[accindex][index] = !newCheckedList[accindex][index];
      setChecksRes(newCheckedList);
    } else if (type === "hero") {
      newCheckedList = [...isCheckedHeros];
      newCheckedList[accindex][index] = !newCheckedList[accindex][index];
      setChecksHeros(newCheckedList);
    }

    if (type !== "hero") {
      if (!newCheckedList[accindex][index]) {
        deleteGear(accindex, index, type);
      } else {
        let acToUpdate = accounts[accindex].name;
        handleGearChange(3, index, acToUpdate, type);
      }
    } else {
      if (!newCheckedList[accindex][index]) {
        deleteHero(accindex, index);
      } else {
        handleHeroChange(accindex, index, 0, 0);
      }
    }
  };

  const handleChange = async (event, accindex, boostname) => {
    const updateBoosts = async (accindex, boostname, boostvalue) => {
      let acToUpdate = accounts[accindex].name;
      let newboost = JSON.stringify({ name: boostname, value: boostvalue });

      try {
        const response = await api.post("/boost/updateBoosts", {
          user,
          acToUpdate,
          newboost,
        });
        if (response == null) {
          console.log("Failed to set boost levels for ", accName);
        } else {
          getUserData();
        }
      } catch (error) {
        console.error("Failed to set boost levels for ", accName);
      }
    };

    clearTimeout(timer);
    timer = setTimeout(() => {
      updateBoosts(accindex, boostname, event.target.value);
    }, 500);
  };

  return (
    <div className="dashboard-container">
      <NavMenu />
      <div className="dashboard-content">
        <h1>{user}'s Account Overview</h1>
        <div className="profile-sections">
          <Row className="mb-3">
            <Col>
              <InputGroup size={viewSize} className="acc-creation">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Account Name
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="acc-name"
                  value={accName}
                  aria-label="acccount name"
                  aria-describedby="inputGroup-sizing-sm"
                  onChange={(event) => {
                    setAccName(event.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </InputGroup>
            </Col>
            <Col xs={8}>
              <Button
                variant="secondary"
                size={viewSize}
                className="add-button"
                onClick={addAccount}
              >
                Create Account
              </Button>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5}>
              <h4>Current Accounts</h4>
            </Col>
          </Row>
          <Accordion>
            {isInitialized &&
              accounts.map((acc, accindex) => (
                <Accordion.Item
                  key={"item" + accindex}
                  eventKey={accindex}
                  className="account-info"
                >
                  <Accordion.Header
                    key={"header" + accindex}
                    className="acc-header"
                  >
                    <h6>
                      {acc.name +
                        " - HQ " +
                        acc.buildings.find((building) => building.name === "HQ")
                          .level}
                    </h6>
                  </Accordion.Header>
                  <Accordion.Body key={"body" + accindex} className="acc-body">
                    <Row>
                      <Col>
                        <strong>Econ. Heroes</strong>
                      </Col>
                      <Col>
                        <strong>Build Settings</strong>
                      </Col>
                      <Col>
                        <strong>Research Settings</strong>
                      </Col>
                      <Col>
                        <Button
                          key={"button" + accindex}
                          variant="danger"
                          onClick={() => handleDelete(acc.name)}
                        >
                          Delete Account
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form key={"formheros" + accindex}>
                          {heroOptions.map((opt, heroindex) => (
                            <Row key={opt}>
                              <Col xs="auto">
                                <Form.Check
                                  size={viewSize}
                                  type="checkbox"
                                  label={opt}
                                  className="acc-option"
                                  key={opt}
                                  checked={isCheckedHeros[accindex][heroindex]}
                                  onChange={() =>
                                    handleCheck(accindex, heroindex, "hero")
                                  }
                                />
                              </Col>
                              <Col xs={6}>
                                <Row>
                                  {isCheckedHeros[accindex][heroindex] && (
                                    <Col>
                                      <Form.Select
                                        className="hero-plus-level-select"
                                        size="sm"
                                        defaultValue={
                                          heroLevels[accindex][heroindex][0]
                                        }
                                        onChange={(ev) =>
                                          handleHeroChange(
                                            accindex,
                                            heroindex,
                                            ev.target.value,
                                            heroLevels[accindex][heroindex][1]
                                          )
                                        }
                                      >
                                        {Array.from(
                                          { length: 6 },
                                          (_, index) => index
                                        ).map((level) => (
                                          <option key={level} value={level}>
                                            {"+" + level}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </Col>
                                  )}
                                  {isCheckedHeros[accindex][heroindex] && (
                                    <Col>
                                      <Form.Select
                                        className="hero-level-select"
                                        size="sm"
                                        defaultValue={
                                          heroLevels[accindex][heroindex][1]
                                        }
                                        onChange={(ev) =>
                                          handleHeroChange(
                                            accindex,
                                            heroindex,
                                            heroLevels[accindex][heroindex][0],
                                            ev.target.value
                                          )
                                        }
                                      >
                                        <option value="11">11</option>
                                        <option value="31">31</option>
                                        <option value="71">71</option>
                                      </Form.Select>
                                    </Col>
                                  )}
                                </Row>
                              </Col>
                            </Row>
                          ))}
                        </Form>
                      </Col>
                      <Col>
                        <Form key={"formbuild" + accindex}>
                          <Row>
                            <Col xs={6}>Build Speed (%):</Col>
                            <Col xs={3}>
                              <Form.Control
                                size="sm"
                                type="text"
                                className="boost-box"
                                value={speedBoosts[accindex][0]}
                                onChange={(ev) =>
                                  handleChange(ev, accindex, "Build Speed")
                                }
                              />
                            </Col>
                          </Row>
                          {buildGearOptions.map((opt, gearindex) => (
                            <Row key={opt}>
                              <Col>
                                <Form.Check
                                  size={viewSize}
                                  type="checkbox"
                                  label={opt}
                                  className="acc-option"
                                  key={opt}
                                  checked={isCheckedBuild[accindex][gearindex]}
                                  onChange={() =>
                                    handleCheck(accindex, gearindex, "build")
                                  }
                                />
                              </Col>
                              <Col>
                                {isCheckedBuild[accindex][gearindex] && (
                                  <Form.Select
                                    className="gear-level-select"
                                    size="sm"
                                    defaultValue={
                                      gearLevelsBuild[accindex][gearindex]
                                    }
                                    onChange={(evt) =>
                                      handleGearChange(
                                        evt.target.value,
                                        gearindex,
                                        acc.name,
                                        "build"
                                      )
                                    }
                                  >
                                    {Array.from(
                                      { length: 5 },
                                      (_, index) => index + 3
                                    ).map((level) => (
                                      <option key={level} value={level}>
                                        {level + "*"}
                                      </option>
                                    ))}
                                  </Form.Select>
                                )}
                              </Col>
                            </Row>
                          ))}
                        </Form>
                      </Col>
                      <Col>
                        <Form key={"formres" + accindex}>
                          <Row>
                            <Col xs={6}>Research Speed (%):</Col>
                            <Col xs={3}>
                              <Form.Control
                                size="sm"
                                type="text"
                                className="boost-box"
                                value={speedBoosts[accindex][1]}
                                onChange={(ev) =>
                                  handleChange(ev, accindex, "Research Speed")
                                }
                              />
                            </Col>
                          </Row>
                          {resGearOptions.map((opt, gearindex) => (
                            <Form.Group as={Row} key={opt}>
                              <Col>
                                <Form.Check
                                  size={viewSize}
                                  type="checkbox"
                                  label={opt}
                                  className="acc-option"
                                  key={opt}
                                  checked={isCheckedRes[accindex][gearindex]}
                                  onChange={() =>
                                    handleCheck(accindex, gearindex, "research")
                                  }
                                />
                              </Col>
                              <Col>
                                {isCheckedRes[accindex][gearindex] && (
                                  <Form.Select
                                    className="gear-level-select"
                                    size="sm"
                                    defaultValue={
                                      gearLevelsRes[accindex][gearindex]
                                    }
                                    onChange={(evt) =>
                                      handleGearChange(
                                        evt.target.value,
                                        gearindex,
                                        acc.name,
                                        "research"
                                      )
                                    }
                                  >
                                    {Array.from(
                                      { length: 5 },
                                      (_, index) => index + 3
                                    ).map((level) => (
                                      <option key={level} value={level}>
                                        {level + "*"}
                                      </option>
                                    ))}
                                  </Form.Select>
                                )}
                              </Col>
                            </Form.Group>
                          ))}
                        </Form>
                      </Col>
                      <Col></Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
