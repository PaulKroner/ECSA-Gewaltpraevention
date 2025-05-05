/**
 * ColumnSelection Component
 *
 * This component renders a set of checkboxes allowing users to filter columns of the table.
 *
 * @param {Object} props.showNachweise - An object containing boolean values that control the checked state of each checkbox.
 * @param {Function} props.handleToggle - A function that handles the checkbox toggle event.
 *
 * @returns {JSX.Element} The rendered ColumnSelection component.
 */

import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const ColumnSelection = ({ showNachweise, handleToggle }) => {
  // Define options for checkboxes
  const checkboxOptions = [
    { id: 'nachweis1', label: 'Führungszeugnis' },
    { id: 'nachweis2', label: 'Grundlagenschulung' },
    { id: 'nachweis3', label: 'Upgradeschulung' },
    { id: 'nachweis4', label: 'Selbstverpflichtungserklärung' },
  ];

  return (
<section className="flex flex-col justify-center gap-4 p-4 border-2 rounded-2xl">
  <p className="flex justify-center text-center">
    Wähle aus, was du filtern möchtest:
  </p>
  <div className="grid grid-cols-1 gap-12 sc:grid-cols-2 lgc:flex lgc:flex-row sc:gap-4">
    {checkboxOptions.map(({ id, label }) => (
      <div key={id} className="grid grid-cols-2 sc:flex sc:items-center sc:gap-2">
        <Label htmlFor={id} className="text-lg justify-self-start sc:ml-4">{label} </Label>
        <Input
          type="checkbox"
          id={id}
          name={id}
          checked={showNachweise[id] || false} // Fallback for undefined
          onChange={() => handleToggle(id)}
          className="w-8 h-8 md:w-6 md:h-6 justify-self-end mr-2 xsc:justify-self-center sm:ml-2"
        />
      </div>
    ))}
  </div>
</section>

  );
};

export default ColumnSelection;
