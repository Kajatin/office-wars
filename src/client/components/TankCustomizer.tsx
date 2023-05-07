import { User, Tank } from "@wasp/entities";
import { useQuery } from "@wasp/queries";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LoadingSpinner from "./LoadingSpinner";

import logout from "@wasp/auth/logout";
import getTank from "@wasp/queries/getTank";
import addTank from "@wasp/actions/addTank";
import updateTank from "@wasp/actions/updateTank";
import removeTank from "@wasp/actions/removeTank";

export default function TankCustomizer(props: { user: User }) {
  const { user } = props;
  const { data: tank, isFetching, error } = useQuery(getTank);

  const [agility, setAgility] = useState(tank?.agility || 2);
  const [armor, setArmor] = useState(tank?.armor || 2);
  const [accuracy, setAccuracy] = useState(tank?.accuracy || 2);
  const [attackPower, setAttackPower] = useState(tank?.attackPower || 2);
  const [color, setColor] = useState(tank?.color || "#199e38");
  const [abilityPoints, setAbilityPoints] = useState(12);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setAgility(tank?.agility || 2);
    setArmor(tank?.armor || 2);
    setAccuracy(tank?.accuracy || 2);
    setAttackPower(tank?.attackPower || 2);
    setColor(tank?.color || "#199e38");
  }, [tank]);

  useEffect(() => {
    setAbilityPoints(20 - (agility + armor + accuracy + attackPower));
  }, [agility, armor, accuracy, attackPower]);

  useEffect(() => {
    if (tank) {
      setChanged(
        tank.agility !== agility ||
          tank.armor !== armor ||
          tank.accuracy !== accuracy ||
          tank.attackPower !== attackPower ||
          tank.color !== color
      );
    } else {
      setChanged(false);
    }
  }, [agility, armor, accuracy, attackPower, color, tank]);

  return (
    <div className="flex flex-col min-w-[24rem] w-full h-full sm:w-fit justify-center">
      <div className="rounded-lg px-4 pt-2 pb-4">
        <div className="flex flex-row justify-between font-medium text-2xl py-1 border-b items-center">
          <div className="flex flex-row gap-1">
            <input
              className="h-7 w-6 self-center rounded hover:-hue-rotate-15"
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
              }}
            />
            <div>
              {user.username}{" "}
              <span className="opacity-60 font-normal text-xl">
                (#{user.id})
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-1">
            <AnimatePresence>
              {(!tank || changed) && (
                <motion.button
                  className="flex self-center text-stone-700 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  onClick={async () => {
                    try {
                      const newTank: Tank = {
                        id: tank?.id || -1,
                        agility: agility,
                        armor: armor,
                        accuracy: accuracy,
                        attackPower: attackPower,
                        color: color,
                      };
                      if (tank) {
                        await updateTank(newTank);
                      } else {
                        await addTank(newTank);
                      }
                    } catch (err) {
                      console.error(err);
                      window.alert(err);
                    }
                  }}
                >
                  <span className="material-symbols-outlined self-center">
                    save
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {tank && (
                <motion.button
                  className="flex self-center text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  onClick={async () => {
                    try {
                      if (!tank) {
                        return;
                      }

                      await removeTank(tank.id);
                    } catch (err) {
                      console.error(err);
                      window.alert(err);
                    }
                  }}
                >
                  <span className="material-symbols-outlined self-center">
                    delete
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <button
              className="flex self-center text-stone-700 hover:bg-stone-200 hover:text-stone-950 rounded transition-all duration-300"
              onClick={logout}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
        {isFetching ? (
          <LoadingSpinner />
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="justify-center content-center">
            <Tank color={color} changed={changed} />
            <div>
              {!tank && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-row gap-1 text-sm text-pink-600 items-center">
                      <span className="material-symbols-outlined">error</span>
                      <span>You must create a tank</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
              <div className="flex justify-between font-medium text-lg items-center">
                <span>Ability points</span>
                <span className="text-base font-normal opacity-70">
                  {abilityPoints} / 20
                </span>
              </div>
              <div className="text-sm opacity-70">
                Assign ability points to customize your tank. You have a total
                of 20 ability points to assign.
              </div>
              <Ability
                name="Agility"
                value={agility}
                onChange={setAgility}
                abilityPoints={abilityPoints}
              />
              <Ability
                name="Armor"
                value={armor}
                onChange={setArmor}
                abilityPoints={abilityPoints}
              />
              <Ability
                name="Accuracy"
                value={accuracy}
                onChange={setAccuracy}
                abilityPoints={abilityPoints}
              />
              <Ability
                name="Attack Power"
                value={attackPower}
                onChange={setAttackPower}
                abilityPoints={abilityPoints}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Ability(props: {
  name: string;
  value: number;
  onChange: (value: number) => void;
  abilityPoints: number;
}) {
  const { name, value, onChange, abilityPoints } = props;

  return (
    <div className="flex flex-col items-center gap-1 my-2">
      <div className="font-medium opacity-70">{name}</div>
      <div className="flex items-center">
        <button
          className={
            "flex rounded p-1 text-lg text-stone-600 transition-all duration-300 " +
            (value <= 0
              ? "opacity-50"
              : "hover:text-stone-900 hover:bg-stone-100")
          }
          disabled={value <= 0}
          onClick={() => {
            if (value >= 20) {
              return;
            }

            onChange(value - 1);
          }}
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <div className="flex flex-row gap-3 mx-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={
                "w-3 h-6 rounded bg-stone-500 flex items-center justify-center transition-all duration-150 " +
                (i < value ? "opacity-100" : "opacity-30")
              }
            />
          ))}
        </div>
        <button
          className={
            "flex rounded p-1 text-lg text-stone-600 transition-all duration-300 " +
            (value >= 10 || abilityPoints <= 0
              ? "opacity-50"
              : "hover:text-stone-900 hover:bg-stone-100")
          }
          disabled={value >= 10 || abilityPoints <= 0}
          onClick={() => {
            if (value >= 10 || abilityPoints <= 0) {
              return;
            }

            onChange(value + 1);
          }}
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  );
}

function Tank(props: { color: string; changed: boolean }) {
  const { color, changed } = props;
  return (
    <div
      className={
        "group flex justify-center py-8 relative overflow-hidden " +
        (changed ? "animate-pulse" : "")
      }
    >
      <svg
        className="w-52 hover:scale-110 hover:drop-shadow-md transition-all"
        style={{
          color: color,
        }}
        viewBox="0 0 620 231"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2.375"
          y="133.214"
          width="470.238"
          height="95.4107"
          rx="47.7054"
          fill="currentColor"
          stroke="#444444"
          strokeWidth="3"
        />
        <path
          d="M104.963 49.413C108.723 46.642 114.896 44.2387 123.044 42.2375C131.153 40.2458 141.069 38.6869 152.196 37.5227C174.447 35.1945 201.419 34.4568 228.219 34.948C255.017 35.4391 281.603 37.1582 303.074 39.7336C313.811 41.0215 323.247 42.521 330.781 44.1824C338.37 45.8558 343.859 47.6592 346.83 49.4837C352.869 53.1915 358.321 60.7434 363.098 70.275C367.849 79.7563 371.825 90.9766 375.017 101.756C378.207 112.527 380.601 122.816 382.198 130.414C382.996 134.212 383.594 137.335 383.993 139.507C384.108 140.136 384.207 140.686 384.289 141.149H79.8264C79.7951 140.695 79.759 140.134 79.7215 139.474C79.6099 137.51 79.4857 134.672 79.4359 131.191C79.3365 124.226 79.5359 114.702 80.728 104.455C81.921 94.2004 84.1026 83.2703 87.9448 73.4708C91.7895 63.6649 97.2576 55.0903 104.963 49.413Z"
          fill="currentColor"
          stroke="#444444"
          strokeWidth="3"
        />
        <path
          d="M164.375 7.56635C165.416 6.61154 167.221 5.7081 169.782 4.92539C172.31 4.15274 175.432 3.53936 178.973 3.07836C186.051 2.15672 194.661 1.86182 203.24 2.0575C211.816 2.25311 220.314 2.93778 227.161 3.95988C230.587 4.4712 233.574 5.06318 235.938 5.71215C238.358 6.37616 239.948 7.05406 240.732 7.65266C242.445 8.9616 244.124 11.7699 245.659 15.5801C247.164 19.3188 248.432 23.7636 249.453 28.0578C250.473 32.3445 251.24 36.442 251.751 39.4706C251.974 40.7883 252.148 41.9017 252.273 42.7381H156.542C156.509 41.9715 156.474 40.9172 156.46 39.6463C156.428 36.8781 156.492 33.0961 156.872 29.0308C157.253 24.9585 157.947 20.6456 159.159 16.7987C160.377 12.9306 162.077 9.67368 164.375 7.56635Z"
          fill="currentColor"
          stroke="#444444"
          strokeWidth="3"
        />
        <rect
          x="1.87641"
          y="0.997692"
          width="237.791"
          height="27.3742"
          rx="8.5"
          transform="matrix(0.956831 -0.290645 0.294107 0.955773 341.835 92.9432)"
          fill="currentColor"
          stroke="#444444"
          strokeWidth="3"
        />
        <rect
          x="1.87641"
          y="0.997692"
          width="51.9975"
          height="51.7031"
          rx="8.5"
          transform="matrix(0.956831 -0.290645 0.294107 0.955773 550.94 17.0742)"
          fill="currentColor"
          stroke="#444444"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute top-0 -inset-full h-full w-1/3 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-30 animate-shine" />
    </div>
  );
}
