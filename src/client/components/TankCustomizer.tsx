import { User, Tank } from "@wasp/entities";
import { useQuery } from "@wasp/queries";

import { useState, useEffect } from "react";

import getTank from "@wasp/queries/getTank";
import addTank from "@wasp/actions/addTank";
import removeTank from "@wasp/actions/removeTank";

export default function TankCustomizer(props: { user: User }) {
  const { user } = props;
  const { data: tank, isFetching, error } = useQuery(getTank);

  const [agility, setAgility] = useState(tank?.agility || 5);
  const [armor, setArmor] = useState(tank?.armor || 5);
  const [accuracy, setAccuracy] = useState(tank?.accuracy || 5);
  const [attackPower, setAttackPower] = useState(tank?.attackPower || 5);
  const [color, setColor] = useState(tank?.color || "#fcba03");
  const [abilityPoints, setAbilityPoints] = useState(0);

  useEffect(() => {
    setAgility(tank?.agility || 5);
    setArmor(tank?.armor || 5);
    setAccuracy(tank?.accuracy || 5);
    setAttackPower(tank?.attackPower || 5);
    setColor(tank?.color || "#fcba03");
  }, [tank]);

  useEffect(() => {
    console.log(color);
  }, [color]);

  useEffect(() => {
    setAbilityPoints(20 - (agility + armor + accuracy + attackPower));
  }, [agility, armor, accuracy, attackPower]);

  {
    /* <button onClick={logout}>Logout</button>
      <br />
      <NewTaskForm />
      <button
        onClick={async () => {
          console.log(tank);
          if (!tank) {
            return;
          }

          await removeTank(tank.id);
        }}
      >
        Remove tank
      </button> */
  }

  return (
    <div className="flex flex-col w-full h-full mx-4 sm:w-fit justify-center">
      <div className="rounded border">
        <div className="font-medium text-lg">
          {user.username}{" "}
          <span className="opacity-60 font-normal">(#{user.id})</span>
        </div>
        {isFetching ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <>
            <div className="flex flex-col my-6">
              <NewTaskForm />
              <button
                onClick={async () => {
                  console.log(tank);
                  if (!tank) {
                    return;
                  }

                  await removeTank(tank.id);
                }}
              >
                Remove tank
              </button>
            </div>

            <Tank color={color} />
            <div className="font-medium">Ability points {abilityPoints}</div>
            <Ability name="Agility" value={agility} onChange={setAgility} />
            <Ability name="Armor" value={armor} onChange={setArmor} />
            <Ability name="Accuracy" value={accuracy} onChange={setAccuracy} />
            <Ability
              name="Attack Power"
              value={attackPower}
              onChange={setAttackPower}
            />
            <div className="flex flex-col items-center">
              <div className="font-medium">Color</div>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Ability(props: {
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const { name, value, onChange } = props;
  return (
    <div className="flex flex-col items-center">
      <div className="font-medium">{name}</div>
      <div className="flex items-center">
        <button
          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
          onClick={() => {
            onChange(value - 1);
          }}
        >
          -
        </button>
        <div className="flex flex-row gap-1.5 mx-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={
                "w-3 h-6 rounded bg-stone-500 flex items-center justify-center " +
                (i < value ? "opacity-100" : "opacity-40")
              }
            />
          ))}
        </div>
        <button
          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
          onClick={() => {
            onChange(value + 1);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Tank(props: { color: string }) {
  const { color } = props;
  return (
    <svg
      className="w-40"
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
  );
}

function NewTaskForm() {
  const handleSubmit = async () => {
    try {
      const tank: Tank = {
        agility: 5,
        armor: 3,
        accuracy: 6,
        attackPower: 1,
        color: "#fcba03",
      };
      await addTank(tank);
    } catch (err) {
      window.alert("Error: " + err.message);
    }
  };

  return <button onClick={handleSubmit}>Create tank</button>;
}
