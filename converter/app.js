const { useState, useMemo } = React;

function Converter() {
  const [type, setType] = useState('length');
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('km');
  const [result, setResult] = useState('');

  const units = useMemo(() => {
    return {
      length: [
        ['km','Kilometer'], ['m','Meter'], ['cm','Centimeter'], ['mm','Millimeter'], ['mi','Mile'], ['ft','Foot'], ['in','Inch']
      ],
      mass: [ ['kg','Kilogram'], ['g','Gram'], ['lb','Pound'], ['oz','Ounce'] ],
      temperature: [ ['C','Celsius'], ['F','Fahrenheit'], ['K','Kelvin'] ]
    }[type];
  }, [type]);

  React.useEffect(()=>{
    // adjust selects when type changes
    setFrom(units[0][0]);
    setTo(units[1] ? units[1][0] : units[0][0]);
  }, [type]);

  function convertNumber(input) { return Number(input); }

  function convert(value, fromUnit, toUnit, type) {
    const val = convertNumber(value);
    if (isNaN(val)) return '';

    if (type === 'temperature') {
      // convert fromUnit -> Celsius -> toUnit
      let c;
      if (fromUnit === 'C') c = val;
      if (fromUnit === 'F') c = (val - 32) * 5/9;
      if (fromUnit === 'K') c = val - 273.15;

      if (toUnit === 'C') return round(c);
      if (toUnit === 'F') return round(c * 9/5 + 32);
      if (toUnit === 'K') return round(c + 273.15);
    }

    // length and mass use base conversion factors
    const lengthToMeters = { km:1000, m:1, cm:0.01, mm:0.001, mi:1609.344, ft:0.3048, in:0.0254 };
    const massToGrams = { kg:1000, g:1, lb:453.59237, oz:28.349523125 };

    if (type === 'length') {
      const inMeters = val * (lengthToMeters[fromUnit] ?? 1);
      return round(inMeters / (lengthToMeters[toUnit] ?? 1));
    }

    if (type === 'mass') {
      const inGrams = val * (massToGrams[fromUnit] ?? 1);
      return round(inGrams / (massToGrams[toUnit] ?? 1));
    }

    return '';
  }

  function round(n) {
    if (!isFinite(n)) return '';
    return Math.round(n * 100000) / 100000;
  }

  function handleConvert() {
    const convertedValue = convert(value, from, to, type);
    setResult(convertedValue);
  }

  function handleClear() {
    setValue('');
    setResult('');
  }

  return (
    <div className="wrap">
      <div className="header">
        <h1>📐 measuremate</h1>
        <label className="type-label">Type:</label>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="length">Length</option>
          <option value="mass">Mass</option>
          <option value="temperature">Temperature</option>
        </select>
      </div>

      <div className="controls">
        <label className="unit-label">Value:</label>
        <input type="number" placeholder="Enter any number to convert" value={value} onChange={e=>setValue(e.target.value)} />

        <label className="unit-label">From:</label>
        <select value={from} onChange={e=>setFrom(e.target.value)}>
          {units.map(u => <option key={u[0]} value={u[0]}>{u[1]}</option>)}
        </select>

        <label className="unit-label">To:</label>
        <select value={to} onChange={e=>setTo(e.target.value)}>
          {units.map(u => <option key={u[0]} value={u[0]}>{u[1]}</option>)}
        </select>

        <button className="convert-btn" onClick={handleConvert}>Convert</button>
        <button className="clear-btn" onClick={handleClear}>Clear</button>
      </div>

      {result !== '' && (
        <div className="result">{value} {units.find(u=>u[0]===from)?.[1]} = {result} {units.find(u=>u[0]===to)?.[1]}</div>
      )}
      {result === '' && value !== '' && <div className="result-placeholder">Click "Convert" to see the result</div>}
      <div className="note">Enter a value and select your units, then click Convert</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Converter />);
